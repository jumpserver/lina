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
        <ActionsGroup slot="headingRightSide" :actions="pageActions" />
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
      required: false,
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
        const objectType = this.$route.meta.title.replace('Detail', '').replace('详情', '')
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
    const detailApiUrl = (function() {
      if (vm.url) {
        return `${vm.url}/${vm.$route.params.id}/`
      } else {
        return getApiPath(vm)
      }
    }())
    const defaultActions = {
      // Delete button
      canDelete: vm.$hasCurrentResAction('delete'),
      deleteCallback: function(item) {
        vm.defaultDelete(item)
      },
      deleteApiUrl: detailApiUrl,
      deleteSuccessRoute: this.$route.name.replace('Detail', 'List'),
      // Update button
      canUpdate: () => {
        return !vm.currentOrgIsRoot && vm.$hasCurrentResAction('change')
      },
      updateCallback: function(item) {
        this.defaultUpdate(item)
      },
      updateRoute: this.$route.name.replace('Detail', 'Update')
    }
    return {
      detailApiUrl,
      defaultActions,
      loading: true,
      validActions: Object.assign(defaultActions, this.actions)
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    pageActions() {
      return [
        {
          name: 'update',
          title: this.$t('common.Update'),
          can: this.validActions.canUpdate,
          has: this.validActions.hasUpdate,
          callback: this.validActions.updateCallback.bind(this)
        },
        {
          name: 'delete',
          title: this.$t('common.Delete'),
          type: 'danger',
          plain: true,
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
        title: this.$t('common.Activity'),
        name: 'ResourceActivity',
        hidden: () => !this.$hasPerm('audits.view_activitylog')
      }
      return [...this.submenu, activity]
    }
  },
  async mounted() {
    try {
      this.loading = true
      await this.getObject()
    } finally {
      this.loading = false
    }
  },
  methods: {
    defaultDelete() {
      const msg = this.$t('common.deleteWarningMsg') + ' ' + this.iTitle + ' ?'
      const title = this.$t('common.Info')
      const performDelete = () => {
        const url = this.validActions.deleteApiUrl
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
            this.$message.success(this.$tc('common.deleteSuccessMsg'))
            this.$router.push({ name: this.validActions.deleteSuccessRoute })
          } catch (error) {
            const errorDetail = error?.response?.data?.detail || ''
            if (errorDetail) {
              this.$message.error(errorDetail)
            } else {
              this.$message.error(this.$tc('common.deleteErrorMsg') + ' ' + error)
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
      const url = this.validActions.detailApiUrl || this.detailApiUrl
      return this.$axios.get(url, { disableFlashErrorMsg: true }).then(data => {
        this.$emit('update:object', data)
        this.$emit('getObjectDone', data)
      }).catch(error => {
        if (error.response && error.response.status === 404) {
          const msg = this.$t('common.ObjectNotFoundOrDeletedMsg')
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
  .page-submenu >>> .el-tabs__header {
    background-color: white;
    margin-left: -25px;
    padding-left: 25px;
    margin-right: -25px;
    padding-right: 25px;
    margin-top: -30px;
    /*margin: 0;*/
    /*background-color: #f3f3f4;*/
  }

  .page-submenu >>> .el-tabs__nav-wrap {
    position: static;
  }
</style>
