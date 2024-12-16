<template>
  <TabPage
    v-if="!loading"
    :active-menu.sync="iActiveMenu"
    :submenu="iSubmenu"
    :title="iTitle"
    @tab-click="handleTabClick"
  >
    <template #headingRightSide>
      <span v-if="hasRightSide">
        <ActionsGroup slot="headingRightSide" :actions="pageActions" class="header-buttons" />
      </span>
    </template>
    <slot />
  </TabPage>
</template>

<script>
import TabPage from '../TabPage'
import { flashErrorMsg } from '@/utils/request'
import { getApiPath } from '@/utils/common'
import ActionsGroup from '@/components/ActionsGroup'
import ResourceActivity from '@/components/Apps/ResourceActivity/index.vue'
import { mapGetters } from 'vuex'
import Vue from 'vue'

Vue.component('ResourceActivity', ResourceActivity)

export default {
  name: 'GenericDetailPage',
  components: {
    TabPage,
    ActionsGroup
  },
  props: {
    url: {
      type: String,
      default: ''
    },
    object: {
      type: Object,
      required: true
    },
    titlePrefix: {
      type: String,
      required: false,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    submenu: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      default: () => ''
    },
    hasActivity: {
      type: Boolean,
      default: () => true
    },
    hasRightSide: {
      type: Boolean,
      default: true
    },
    actions: {
      type: Object, // 查看defaultActions设置
      default: () => ({})
    },
    getObjectName: {
      type: Function,
      default: function(obj) {
        return obj.name
      }
    },
    getTitle: {
      type: Function,
      default: function(obj) {
        const objectType = this.$route.meta.title
          .replace('Details', '')
          .replace('Detail', '')
          .replace('详情', '')
          .trim()
        this.$log.debug('Object is: ', obj)
        const titlePrefix = this.titlePrefix || objectType
        const objectName = this.getObjectName(obj)
        let title = `${titlePrefix}: ${objectName}`
        if (title.length > 80) {
          title = title.slice(0, 80) + '...'
        }
        return title
      }
    }
  },
  data() {
    const vm = this
    const defaultActions = {
      // Delete button
      canDelete: vm.$hasCurrentResAction('delete'),
      hasDelete: true,
      deleteCallback: function(item) {
        vm.defaultDelete(item)
      },
      deleteSuccessRoute: this.$route.name.replace('Detail', 'List'),
      // Update button
      canUpdate: () => {
        return !vm.currentOrgIsRoot && vm.$hasCurrentResAction('change')
      },
      hasUpdate: true,
      updateCallback: function(item) {
        this.defaultUpdate(item)
      },
      updateRoute: this.$route.name.replace('Detail', 'Update')
    }
    return {
      defaultActions,
      loading: true,
      drawer: '',
      action: '',
      actionId: '',
      validActions: Object.assign(defaultActions, this.actions)
    }
  },

  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    pageActions() {
      return [
        {
          name: 'update',
          title: this.$t('Edit'),
          icon: 'el-icon-edit-outline',
          size: 'small',
          can: this.validActions.canUpdate,
          has: this.validActions.hasUpdate && !this.drawer,
          callback: this.validActions.updateCallback.bind(this)
        },
        {
          name: 'delete',
          title: this.$t('Delete'),
          type: 'danger',
          plain: true,
          icon: 'el-icon-delete',
          size: 'small',
          can: this.validActions.canDelete,
          has: this.validActions.hasDelete,
          callback: this.validActions.deleteCallback.bind(this)
        }
      ]
    },
    iTitle() {
      return this.title || this.getTitle(this.object)
    },
    iActiveMenu: {
      get() {
        return this.activeMenu
      },
      set(item) {
        this.$emit('update:activeMenu', item)
      }
    },
    iSubmenu() {
      if (!this.hasActivity) {
        return this.submenu
      }
      const activity = {
        title: this.$t('Activity'),
        name: 'ResourceActivity',
        hidden: () => !this.$hasPerm('audits.view_activitylog')
      }
      return [...this.submenu, activity]
    }
  },
  async created() {
    try {
      this.loading = true
      await this.checkDrawer()
      await this.getObject()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async checkDrawer() {
      const drawActionMeta = await this.$store.dispatch('common/getDrawerActionMeta')
      if (drawActionMeta) {
        this.drawer = true
        this.row = drawActionMeta.row
        this.actionId = this.row?.id
      }
    },
    getDetailUrl() {
      const vm = this
      let objectId = ''
      if (this.actionId) {
        objectId = this.actionId
      } else {
        objectId = vm.$route.params.id
      }
      if (vm.url) {
        return `${vm.url}/${objectId}/`
      } else {
        return getApiPath(vm, objectId)
      }
    },
    afterDelete() {
      if (this.drawer) {
        this.$emit('close-drawer')
        this.$emit('detail-delete-success')
        this.$emit('reload-table')
      } else {
        this.$message.success(this.$tc('DeleteSuccessMsg'))
        this.$router.push({ name: this.validActions.deleteSuccessRoute })
      }
    },
    defaultDelete() {
      const msg = this.$t('DeleteWarningMsg') + ' ' + this.iTitle + ' ?'
      const title = this.$t('Info')
      const performDelete = () => {
        const url = this.getDetailUrl()
        this.$log.debug('Start perform delete: ', url)
        return this.$axios.delete(url)
      }

      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete.bind(this)()
            done()
            this.afterDelete()
          } catch (error) {
            const errorDetail = error?.response?.data?.detail || ''
            if (errorDetail) {
              this.$message.error(errorDetail)
            } else {
              this.$message.error(this.$tc('DeleteErrorMsg') + ' ' + error)
            }
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    defaultUpdate() {
      const id = this.$route.params.id
      let route = this.validActions.updateRoute
      if (typeof route === 'string') {
        route = { name: route, params: {}}
      }
      route = {
        ...route,
        query: this.$route.query || {}
      }
      route.params.id = id
      this.$router.push(route)
    },
    getObject() {
      // 兼容之前的 detailApiUrl
      const url = this.getDetailUrl()
      return this.$axios.get(url, { disableFlashErrorMsg: true }).then(data => {
        this.$emit('update:object', data)
        this.$emit('getObjectDone', data)
      }).catch(error => {
        if (error.response && error.response.status === 404) {
          const msg = this.$tc('ObjectNotFoundOrDeletedMsg')
          this.$message.error(msg)
        } else {
          flashErrorMsg({ error, response: error.response })
        }
      })
    },
    handleTabClick(tab) {
      this.$emit('tab-click', tab, this.iActiveMenu)
      this.$emit('update:activeMenu', tab.name)
      this.$log.debug('Current tab is: ', this.activeMenu)
    }
  }
}
</script>

<style scoped>
.header-buttons {
  z-index: 999;
}
</style>
