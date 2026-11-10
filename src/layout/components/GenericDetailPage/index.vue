<template>
  <TabPage
    v-model:active-menu="iActiveMenu"
    :submenu="iSubmenu"
    :title="detailTitle"
    :hide-heading="drawer"
    class="generic-detail-page"
    @tab-click="handleTabClick"
  >
    <template
      v-if="!loading && !loadError && ($slots.headingRightSide || (hasRightSide && hasPageActions))"
      #headingRightSide
    >
      <slot name="headingRightSide">
        <ActionsGroup
          v-if="hasRightSide"
          :actions="pageActions"
          size="default"
          class="header-buttons"
        />
      </slot>
    </template>
    <!-- Keep slot roots directly under TabPage so its section spacing reaches tab content. -->
    <template v-if="!loading">
      <el-result v-if="loadError" icon="warning" :title="loadError" />
      <slot v-else />
    </template>
  </TabPage>
</template>

<script>
import TabPage from '../TabPage'
import { flashErrorMsg } from '@/utils/request'
import { getApiPath } from '@/utils/common/index'
import ActionsGroup from '@/components/Common/ActionsGroup'
import { getRuntimeActionMeta, getRuntimeRoute } from '@/libs/context/runtime'
import { mapGetters } from 'vuex'
import pagePresentation from '../pagePresentation'

export default {
  name: 'GenericDetailPage',
  components: {
    TabPage,
    ActionsGroup
  },
  mixins: [pagePresentation],
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
    notFoundMessage: {
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
      default: function (obj) {
        return obj.name
      }
    },
    getTitle: {
      type: Function,
      default: function (obj) {
        const objectName = obj?.name || ''
        return objectName
      }
    }
  },
  emits: [
    'update:activeMenu',
    'tab-click',
    'update:object',
    'getObjectDone',
    'close-drawer',
    'detail-delete-success',
    'open-update-drawer',
    'reload-table'
  ],
  data() {
    const vm = this
    const defaultActions = {
      // Delete button
      canDelete: vm.$hasCurrentResAction('delete'),
      hasDelete: true,
      deleteCallback: function (item) {
        vm.defaultDelete(item)
      },
      deleteSuccessRoute: String(getRuntimeRoute(this).name || '').replace(/Detail$/, 'List'),
      // Update button
      canUpdate: () => {
        return !vm.currentOrgIsRoot && vm.$hasCurrentResAction('change')
      },
      hasUpdate: true,
      updateCallback: function (item) {
        this.defaultUpdate(item)
      },
      updateRoute: String(getRuntimeRoute(this).name || '').replace(/(Detail|List)$/, 'Update')
    }
    return {
      defaultActions,
      loading: true,
      loadError: '',
      detailDisposed: false,
      action: '',
      actionId: '',
      validActions: Object.assign(defaultActions, this.actions)
    }
  },

  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    hasLoadedObject() {
      return !!(this.object && Object.keys(this.object).length > 0)
    },
    pageActions() {
      return [
        {
          name: 'update',
          title: this.$t('Edit'),
          type: 'primary',
          icon: 'el-icon-edit',
          can: this.validActions.canUpdate,
          has: this.validActions.hasUpdate,
          callback: this.validActions.updateCallback.bind(this)
        },
        {
          name: 'delete',
          title: this.$t('Delete'),
          type: 'danger',
          plain: true,
          icon: 'el-icon-delete',
          can: this.validActions.canDelete,
          has: this.validActions.hasDelete,
          callback: this.validActions.deleteCallback.bind(this)
        }
      ]
    },
    hasPageActions() {
      return this.pageActions.some((action) =>
        typeof action.has === 'function' ? action.has(action) : (action.has ?? true)
      )
    },
    detailTitle() {
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
  beforeUnmount() {
    this.detailDisposed = true
  },
  async created() {
    await this.loadObject()
  },
  async activated() {
    if (this.loading || this.hasLoadedObject) return
    await this.loadObject()
  },
  methods: {
    async loadObject() {
      try {
        this.loading = true
        if (this.drawer) await this.checkDrawer()
        if (!this.detailDisposed) await this.getObject()
      } finally {
        this.loading = false
      }
    },
    async getDrawerMeta() {
      return getRuntimeActionMeta(this)
    },
    async checkDrawer() {
      const drawActionMeta = await this.getDrawerMeta()
      if (drawActionMeta && drawActionMeta.action) {
        this.row = drawActionMeta.row
        this.actionId = drawActionMeta.id
      }
    },
    getDetailUrl() {
      const vm = this
      const objectId = this.actionId || this.$context.get('id')
      // 兼容之前的 detailApiUrl
      if (vm.validActions.detailApiUrl || vm.detailApiUrl) {
        return vm.validActions.detailApiUrl || vm.detailApiUrl
      }
      const url = _.trimEnd(vm.url, '/')
      return url ? `${url}/${objectId}/` : getApiPath(vm, objectId)
    },
    afterDelete() {
      if (this.drawer) {
        this.emitDrawerAction('close', 'close-drawer')
        this.$emit('detail-delete-success')
        this.emitDrawerAction('reload', 'reload-table')
      } else {
        this.$message.success(this.$tc('DeleteSuccessMsg'))
        this.$router.push({ name: this.validActions.deleteSuccessRoute })
      }
    },
    defaultDelete() {
      const msg = this.$t('DeleteWarningMsg') + ' ' + this.detailTitle + ' ?'
      const title = this.$t('Info')
      const performDelete = () => {
        const url = this.getDetailUrl()
        this.$log.debug('Start perform delete: ', url)
        return this.$axios.delete(url)
      }

      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        closeOnPressEscape: true,
        showCancelButton: true,
        beforeClose: async (action, instance, done) => {
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
            done()
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    defaultUpdate() {
      const id = this.actionId || this.$context.get('id')
      let route = this.validActions.updateRoute
      if (typeof route === 'function') {
        route = route({
          object: this.object,
          row: this.row,
          id
        })
      }
      if (this.drawer) {
        const row = this.object?.id ? this.object : { ...(this.row || {}), id }
        const location = typeof route === 'string' ? { name: route } : route
        this.emitDrawerAction('update', 'open-update-drawer', {
          row,
          route: { ...location, params: { ...location?.params, id } },
          query: location?.query || {}
        })
        return
      }
      if (typeof route === 'string') {
        route = { name: route, params: {} }
      }
      route = {
        ...route,
        query: {
          ...(this.$route.query || {}),
          ...(route?.query || {})
        }
      }
      route.params = {
        ...(route.params || {}),
        id
      }
      this.$router.push(route)
    },
    emitDrawerAction(action, event, payload) {
      const handler = this.$context.get('handlers', { scope: 'overlay' })?.[action]
      if (handler) handler(payload)
      else this.$emit(event, payload)
    },
    getObject() {
      // 兼容之前的 detailApiUrl
      const url = this.getDetailUrl()
      this.loadError = ''
      const onLoaded = this.$context.get('handlers', { scope: 'overlay' })?.loaded
      return this.$axios
        .get(url, { disableFlashErrorMsg: true })
        .then((data) => {
          if (this.detailDisposed) return
          onLoaded?.(data)
          this.$emit('update:object', data)
          this.$emit('getObjectDone', data)
        })
        .catch((error) => {
          if (this.detailDisposed) return
          this.loadError =
            error.response?.status === 404
              ? this.notFoundMessage || this.$t('ObjectNotFoundOrDeletedMsg')
              : this.$t(error.response?.status === 403 ? 'NoPermissionVew' : 'PageLoadErrorMsg')
          if (error.response && error.response.status === 404) {
            this.$message.error(this.loadError)
          } else if (error.response) {
            flashErrorMsg({ error, response: error.response })
          } else {
            this.$message.error(this.loadError)
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

<style lang="scss" scoped>
.header-buttons {
  --data-actions-gap: 8px;

  :deep(.el-button.action-item) {
    min-width: 76px;
    height: 30px;
    padding: 0 14px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
  }

  :deep(.action-content) {
    gap: 6px;
  }

  :deep(.action-content .pre-icon) {
    font-size: 14px;
  }

  :deep(.action-content .pre-icon + span) {
    margin-left: 0;
  }

  :deep(.el-button.delete) {
    --el-button-bg-color: var(--el-bg-color);
    --el-button-border-color: var(--el-border-color);
    --el-button-hover-text-color: var(--el-color-danger);
    --el-button-hover-bg-color: var(--el-color-danger-light-9);
    --el-button-hover-border-color: var(--el-color-danger-light-5);
    --el-button-active-text-color: var(--el-color-danger);
    --el-button-active-bg-color: var(--el-color-danger-light-8);
    --el-button-active-border-color: var(--el-color-danger);
  }
}
</style>
