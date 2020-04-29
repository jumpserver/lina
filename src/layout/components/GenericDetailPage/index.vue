<template>
  <TabPage v-if="!loading" :submenu="submenu" :active-menu.sync="activeName" @tab-click="handleTabClick">
    <template #title>
      <span>
        {{ validTitle }}
      </span>
    </template>

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
import { getApiPath } from '@/utils/common'
import ActionsGroup from '@/components/ActionsGroup'

export default {
  name: 'GenericDetailPage',
  components: {
    TabPage,
    ActionsGroup
  },
  props: {
    object: {
      type: Object,
      required: true
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
        const objectType = this.$tr(this.$route.meta.title)
          .replace('Detail', '')
          .replace('详情', '')
        this.$log.debug('Object is: ', obj)
        const objectName = this.getObjectName(obj)
        return `${objectType}: ${objectName}`
      }
    }
  },
  data() {
    const defaultActions = {
      canDelete: true,
      deleteCallback: function(item) { this.defaultDelete(item) },
      deleteApiUrl: getApiPath(this),
      deleteSuccessRoute: this.$route.name.replace('Detail', 'List'),
      canUpdate: true,
      updateCallback: function(item) { this.defaultUpdate(item) },
      updateRoute: this.$route.name.replace('Detail', 'Update'),
      detailApiUrl: getApiPath(this)
    }
    return {
      loading: true,
      activeName: this.activeMenu,
      validActions: Object.assign(defaultActions, this.actions)
    }
  },
  computed: {
    pageActions() {
      return [
        {
          name: 'update',
          title: this.$tc('Update'),
          can: this.validActions.canUpdate,
          callback: this.validActions.updateCallback.bind(this)
        },
        {
          name: 'delete',
          title: this.$tc('Delete'),
          can: this.validActions.canDelete,
          callback: this.validActions.deleteCallback.bind(this)
        }
      ]
    },
    validTitle() {
      return this.title || this.getTitle(this.object)
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
      const msg = this.$tc('Are you sure to delete') + ' ?'
      const title = this.$tc('Info')
      const performDelete = async function() {
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
            this.$message.success(this.$tc('Delete success'))
            this.$router.push({ name: this.validActions.deleteSuccessRoute })
          } catch (error) {
            this.$message.error(this.$tc('Delete failed' + ' ' + error))
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
      const routeName = this.validActions.updateRoute
      this.$router.push({ name: routeName, params: { id: id }})
    },
    getObject() {
      const url = this.validActions.detailApiUrl
      return this.$axios.get(url).then(data => {
        this.$emit('update:object', data)
      })
    },
    handleTabClick(tab) {
      this.$emit('tab-click', tab)
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
