<template>
  <div
    v-loading="loadingStatus"
    :class="{ 'is-compact': compact, 'has-square-buttons': squareButtons }"
    class="table-actions-formatter"
  >
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
            <Icon
              v-if="action.icon"
              :icon="action.icon"
              :style="action.iconStyle"
              class="pre-icon"
            />
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
              <el-dropdown-item :command="action" :disabled="action.disabled">
                <div class="dropdown-item__content">
                  <span v-if="action.icon" class="pre-icon">
                    <Icon :icon="action.icon" />
                  </span>
                  <span class="dropdown-item__label">{{ action.title }}</span>
                  <el-tooltip
                    v-if="action.tip"
                    :content="action.tip"
                    :show-after="300"
                    placement="right"
                  >
                    <span class="dropdown-item__help" @click.stop>
                      <Icon icon="fa-question-circle-o" />
                    </span>
                  </el-tooltip>
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

// Icons default to Free Regular in the Icon component; declare Solid explicitly when needed.
const ACTION_ICON_MAP = {
  update: 'fa-pen-to-square',
  edit: 'fa-pen-to-square',
  view: 'fa-eye',
  detail: 'fa-eye',
  delete: 'fa-trash-can',
  remove: 'fa-square-minus',
  add: 'fa-solid fa-plus',
  create: 'fa-solid fa-plus',
  clone: 'fa-copy',
  duplicate: 'fa-copy',
  copy: 'fa-copy',
  connect: 'fa-solid fa-desktop',
  login: 'fa-solid fa-right-to-bracket',
  execute: 'fa-solid fa-play',
  run: 'fa-solid fa-play',
  test: 'fa-solid fa-plug',
  stop: 'fa-circle-stop',
  log: 'fa-solid fa-file-lines',
  logging: 'fa-solid fa-file-lines',
  output: 'fa-solid fa-file-lines',
  report: 'fa-solid fa-chart-column',
  record: 'fa-eye',
  retry: 'fa-solid fa-rotate',
  refresh: 'fa-solid fa-rotate',
  sync: 'fa-solid fa-rotate',
  download: 'fa-solid fa-download',
  upload: 'fa-solid fa-upload',
  enable: 'fa-circle-check',
  disable: 'fa-solid fa-ban',
  active: 'fa-circle-check',
  inactive: 'fa-solid fa-ban',
  reject: 'fa-solid fa-ban',
  accept: 'fa-solid fa-check',
  approve: 'fa-solid fa-check',
  revoke: 'fa-solid fa-xmark',
  cancel: 'fa-solid fa-xmark',
  close: 'fa-solid fa-xmark',
  reset: 'fa-solid fa-rotate',
  clear: 'fa-solid fa-eraser',
  unlock: 'fa-solid fa-unlock',
  bind: 'fa-solid fa-link',
  select: 'fa-solid fa-check',
  ignore: 'fa-solid fa-forward',
  expire: 'fa-solid fa-clock',
  expired: 'fa-solid fa-clock',
  invite: 'fa-solid fa-user-plus',
  user: 'fa-user',
  account: 'fa-user',
  password: 'fa-solid fa-key',
  secret: 'fa-solid fa-key',
  permission: 'fa-solid fa-lock',
  asset: 'fa-solid fa-desktop',
  info: 'fa-solid fa-circle-info',
  detail_info: 'fa-solid fa-circle-info',
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
        icon: ACTION_ICON_MAP.update,
        has: colActions.hasUpdate,
        can: colActions.canUpdate,
        callback: colActions.onUpdate,
        order: 10
      },
      {
        name: 'delete',
        title: this.$t('Delete'),
        icon: ACTION_ICON_MAP.delete,
        type: 'danger',
        has: colActions.hasDelete,
        can: colActions.canDelete,
        callback: colActions.onDelete,
        order: 20
      },
      {
        name: 'clone',
        title: this.$t('Duplicate'),
        icon: ACTION_ICON_MAP.clone,
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
    },
    compact() {
      return Boolean(this.colActions.compact)
    },
    squareButtons() {
      return Boolean(this.colActions.squareButtons)
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
      const name = String(action.name || '').trim()
      const normalized = [
        name.toLowerCase(),
        ...name
          .replace(/([a-z\d])([A-Z])/g, '$1 $2')
          .toLowerCase()
          .split(/[^a-z\d]+/)
          .filter(Boolean)
      ]

      for (const value of normalized) {
        if (ACTION_ICON_MAP[value]) {
          return ACTION_ICON_MAP[value]
        }
      }
      return ''
    },
    getButtonProps(action) {
      const { type, disabled, plain, loading, hoverType } = action
      return {
        size: 'small',
        type,
        disabled,
        plain,
        loading,
        style: hoverType
          ? {
              '--el-button-hover-text-color': `var(--el-color-${hoverType})`,
              '--el-button-hover-border-color': `var(--el-color-${hoverType})`,
              '--el-button-hover-bg-color': 'var(--el-button-bg-color)'
            }
          : undefined
      }
    },
    getActionTip(action) {
      if (action.showTip === false) {
        return ''
      }
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
.table-actions-formatter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 24px;
}

.table-actions-formatter.is-compact {
  min-height: 20px;

  .table-actions-group :deep(.table-action-btn) {
    height: 20px;
    min-height: 20px;
    padding: 2px 6px;
  }
}

.table-actions-formatter.has-square-buttons {
  .table-actions-group :deep(.table-action-btn) {
    width: 20px;
    min-width: 20px;
    padding: 0;
  }
}

.table-actions-group {
  display: inline-flex;
  align-items: center;
  min-width: max-content;
  gap: 4px;
  vertical-align: middle;
  white-space: nowrap;

  .table-action-trigger {
    display: inline-flex;
  }

  :deep(.table-action-btn) {
    height: 24px;
    min-height: 24px;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 14px;
    box-shadow: none;

    &.more-action {
      padding: 4px 6px;
    }

    > span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 14px;
      font-size: 12px;
    }

    .pre-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &.el-button--danger.is-plain.is-disabled {
      color: var(--el-button-disabled-text-color);
    }
  }

  :deep(.table-action-btn.is-disabled:hover .fa-play) {
    color: var(--el-color-primary-light-3) !important;
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

:global(.action-dropdown.el-dropdown__popper .dropdown-item__help) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  color: var(--el-text-color-placeholder);
  cursor: help;
}

:global(.action-dropdown.el-dropdown__popper .dropdown-item__help:hover) {
  color: var(--el-color-primary);
}
</style>
