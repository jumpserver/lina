<template>
  <div v-loading="loadingStatus">
    <div v-if="actions.length > 0 || moreActions.length > 0" class="table-actions-group">
      <el-tooltip
        v-for="action in actions"
        :key="action.name"
        :content="getActionTip(action)"
        :disabled="!getActionTip(action)"
        :show-after="500"
        placement="top"
      >
        <span class="table-action-trigger">
          <el-button
            v-bind="getButtonProps(action)"
            class="table-action-btn"
            @click="handleActionClick(action)"
          >
            <Icon v-if="action.icon" :icon="action.icon" class="pre-icon" />
            <span v-else>{{ action.title }}</span>
          </el-button>
        </span>
      </el-tooltip>

      <el-dropdown
        v-if="moreActions.length > 0"
        class="table-action-dropdown"
        popper-class="action-dropdown"
        trigger="click"
        @command="handleDropdownCommand"
      >
        <span class="table-action-trigger">
          <el-button v-bind="moreButtonProps" class="table-action-btn more-action">
            <Icon :icon="moreActionIcon" class="pre-icon" />
          </el-button>
        </span>

        <template #dropdown>
          <el-dropdown-menu style="overflow: auto; max-height: 60vh">
            <template v-for="action in moreActions" :key="action.name">
              <el-dropdown-item :command="action" :disabled="action.disabled" :title="action.tip">
                <div class="dropdown-item__content">
                  <span v-if="action.icon" class="pre-icon">
                    <Icon :icon="action.icon" />
                  </span>
                  <span class="dropdown-item__label">{{ action.title }}</span>
                </div>
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import BaseFormatter from './base.vue'
import Icon from '@/components/Widgets/Icon/index.vue'

const ACTION_ICON_MAP = {
  update: 'fa-pencil-square-o',
  edit: 'fa-pencil-square-o',
  view: 'fa-eye',
  detail: 'fa-eye',
  delete: 'fa-trash-o',
  remove: 'fa-minus-square-o',
  clone: 'fa-files-o',
  duplicate: 'fa-files-o',
  copy: 'fa-files-o',
  connect: 'fa-desktop',
  login: 'fa-sign-in',
  execute: 'fa-play-circle-o',
  run: 'fa-play-circle-o',
  test: 'fa-play-circle-o',
  stop: 'fa-stop-circle-o',
  retry: 'fa-refresh',
  refresh: 'fa-refresh',
  sync: 'fa-refresh',
  download: 'fa-download',
  upload: 'fa-upload',
  enable: 'fa-check-circle-o',
  disable: 'fa-ban',
  active: 'fa-check-circle-o',
  inactive: 'fa-ban',
  reject: 'fa-ban',
  accept: 'fa-check',
  approve: 'fa-check',
  revoke: 'fa-times',
  cancel: 'fa-times',
  close: 'fa-times',
  reset: 'fa-refresh',
  invite: 'fa-user-plus',
  user: 'fa-user',
  account: 'fa-user',
  password: 'fa-key',
  secret: 'fa-key',
  permission: 'fa-lock',
  asset: 'fa-desktop',
  info: 'fa-info-circle-o',
  detail_info: 'fa-info-circle-o',
  more: 'el-icon-more'
}

const defaultPerformDelete = function ({ row, col }) {
  const id = row.id
  const url = new URL(this.url, location.origin)
  url.pathname += `${id}/`
  const deleteUrl = url.href
  return this.$axios.delete(deleteUrl)
}

const defaultUpdateCallback = function ({ row, col }) {
  const id = row.id
  let route = { params: { id: id } }
  const updateRoute = this.colActions.updateRoute

  if (typeof updateRoute === 'object') {
    route = Object.assign(route, updateRoute)
  } else if (typeof updateRoute === 'function') {
    route = updateRoute({ row, col })
  } else {
    route.name = updateRoute
  }

  this.$router.push(route)
}

const defaultViewCallback = function ({ row, col }) {
  const id = row.id
  let route = { params: { id: id } }
  const viewRoute = this.colActions.viewRoute

  if (typeof updateRoute === 'object') {
    route = Object.assign(route, viewRoute)
  } else if (typeof updateRoute === 'function') {
    route = viewRoute({ row, col })
  } else {
    route.name = viewRoute
  }

  this.$router.push(route)
}

const defaultCloneCallback = function ({ row, col }) {
  const id = row.id
  let route = { query: { clone_from: id } }
  const cloneRoute = this.colActions.cloneRoute

  if (typeof cloneRoute === 'object') {
    route = Object.assign(route, cloneRoute)
  } else if (typeof cloneRoute === 'function') {
    route = cloneRoute({ row, col })
  } else {
    route.name = cloneRoute
  }
  this.$router.push(route)
}

const defaultDeleteCallback = function ({ row, col, cellValue, reload }) {
  let msg = this.$t('DeleteWarningMsg')
  const name = row.name || row.hostname
  if (name) {
    msg += ` "${name}" `
  }
  msg += ' ?'
  const title = this.$t('Info')
  const performDelete = this.colActions.performDelete
  const afterDelete = this.colActions.afterDelete
  this.$alert(msg, title, {
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
    showCancelButton: true,
    beforeClose: async (action, instance, done) => {
      if (action !== 'confirm') return done()
      instance.confirmButtonLoading = true
      try {
        await performDelete.bind(this)({ row: row, col: col })
        done()
        reload()
        if (afterDelete instanceof Function) {
          afterDelete({ row: row, col: col })
        }
        this.$message.success(this.$tc('DeleteSuccessMsg'))
      } finally {
        instance.confirmButtonLoading = false
      }
    }
  }).catch(() => {
    /* 取消*/
  })
}

export default {
  name: 'ActionsFormatter',
  components: { Icon },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          hasUpdate: true,
          canUpdate: true,
          hasDelete: true,
          canDelete: true,
          hasClone: true,
          canClone: true,
          updateRoute: 'GroupUpdate',
          cloneRoute: 'GroupCreate',
          performDelete: defaultPerformDelete,
          onUpdate: defaultUpdateCallback,
          onView: defaultViewCallback,
          onDelete: defaultDeleteCallback,
          onClone: defaultCloneCallback,
          extraActions: []
        }
      }
    }
  },
  data() {
    const colActions = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    const defaultActions = [
      {
        name: 'update',
        title: this.$t('Edit'),
        type: 'primary',
        plain: true,
        icon: 'fa-pencil-square-o',
        has: colActions.hasUpdate,
        can: colActions.canUpdate,
        callback: colActions.onUpdate,
        order: 10
      },
      {
        name: 'delete',
        title: this.$t('Delete'),
        icon: 'fa-trash-o',
        type: 'danger',
        has: colActions.hasDelete,
        can: colActions.canDelete,
        callback: colActions.onDelete,
        order: 20
      },
      {
        name: 'clone',
        title: this.$t('Duplicate'),
        icon: 'fa-files-o',
        has: colActions.hasClone,
        can: colActions.canClone,
        callback: colActions.onClone,
        order: 30
      }
    ]
    return {
      colActions,
      defaultActions,
      extraActions: colActions.extraActions
    }
  },
  computed: {
    cleanedActions() {
      let actions = [...this.defaultActions, ...this.extraActions]
      actions = _.cloneDeep(actions)
      actions = actions.map((action) => {
        action.has = this.cleanBoolean(action, 'has', true)
        action.can = this.cleanBoolean(action, 'can', true)
        action.callback = this.cleanCallback(action, 'callback')
        action.icon = this.cleanValue(action, 'icon') || this.inferActionIcon(action)
        action.order = action.order || 100
        action.tip = this.cleanValue(action, 'tip')
        action.title = this.cleanValue(action, 'title')
        action.type = action.type || ''
        action.plain = true
        action.disabled = !action.can
        return action
      })
      actions = actions.filter((action) => action.has)
      actions.sort((a, b) => a.order - b.order)
      return actions
    },
    actions() {
      if (this.cleanedActions.length <= 2) {
        return this.cleanedActions
      }
      return this.cleanedActions.slice(0, 1)
    },
    moreActions() {
      if (this.cleanedActions.length <= 2) {
        return []
      }
      return this.cleanedActions.slice(1)
    },
    moreActionIcon() {
      return ACTION_ICON_MAP.more
    },
    moreButtonProps() {
      return {
        size: 'small',
        type: '',
        plain: false
      }
    },
    loadingStatus() {
      return this.col.formatterArgs.loading
    }
  },
  methods: {
    cleanBoolean(item, attr, defaults) {
      const ok = item[attr]
      if (typeof ok !== 'function') {
        return ok === undefined ? defaults : ok
      }
      return this.cleanValue(item, attr)
    },
    inferActionIcon(action) {
      const candidates = [action.name]
      const normalized = candidates
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase())

      for (const value of normalized) {
        if (ACTION_ICON_MAP[value]) {
          return ACTION_ICON_MAP[value]
        }
      }
      return ''
    },
    getButtonProps(action) {
      const { type, disabled, plain, loading } = action
      return {
        size: 'small',
        type,
        disabled,
        plain,
        loading
      }
    },
    getActionTip(action) {
      if (action.tip) {
        return action.tip
      }
      if (action.icon && action.title) {
        return action.title
      }
      return ''
    },
    handleActionClick(action) {
      if (!action || action.disabled || !action.callback) {
        return
      }
      action.callback(action)
    },
    handleDropdownCommand(action) {
      if (!action || action.disabled || !action.callback) {
        return
      }
      action.callback(action)
    },
    cleanCallback(item, attr) {
      const callback = item[attr]
      const attrs = {
        reload: this.reload,
        row: this.row,
        col: this.col,
        cellValue: this.cellValue,
        tableData: this.tableData
      }
      return () => callback.bind(this)(attrs)
    },
    cleanValue(item, attr) {
      const value = item[attr]
      if (!value || typeof value !== 'function') {
        return value
      }
      const attrs = {
        reload: this.reload,
        row: this.row,
        col: this.col,
        cellValue: this.cellValue,
        tableData: this.tableData
      }
      return value(attrs)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-actions-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  vertical-align: middle;

  .table-action-trigger {
    display: inline-flex;
  }

  :deep(.table-action-btn) {
    min-height: 24px;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 1.3;
    box-shadow: none;

    &.more-action {
      padding: 4px 6px;
    }

    > span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1.2;
      font-size: 12px;
    }

    .pre-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }

  :deep(.table-action-dropdown) {
    display: inline-flex;
  }
}

:global(.action-dropdown.el-dropdown__popper .el-dropdown-menu--small) {
  padding: 6px 0;
}

:global(.action-dropdown.el-dropdown__popper .el-dropdown-menu__item) {
  line-height: 1.4;
}

:global(.action-dropdown.el-dropdown__popper .dropdown-item__content) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

:global(.action-dropdown.el-dropdown__popper .dropdown-item__content .pre-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
