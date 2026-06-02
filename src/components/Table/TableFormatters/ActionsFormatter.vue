<template>
  <ActionsGroup
    v-loading="loadingStatus"
    :actions="actions"
    :more-actions="moreActions"
    :more-actions-title="moreActionsTitle"
    size="default"
    class="table-actions"
  />
</template>

<script>
import ActionsGroup from '@/components/Common/ActionsGroup/index.vue'
import BaseFormatter from './base.vue'

const defaultPerformDelete = function({ row, col }) {
  const id = row.id
  const url = new URL(this.url, location.origin)
  url.pathname += `${id}/`
  const deleteUrl = url.href
  return this.$axios.delete(deleteUrl)
}

const defaultUpdateCallback = function({ row, col }) {
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

const defaultViewCallback = function({ row, col }) {
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

const defaultCloneCallback = function({ row, col }) {
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

const defaultDeleteCallback = function({ row, col, cellValue, reload }) {
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
  components: { ActionsGroup },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default: function() {
        return {
          hasUpdate: true, // can set function(row, value)
          canUpdate: true, // can set function(row, value)
          hasDelete: true, // can set function(row, value)
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
        has: colActions.hasUpdate,
        can: colActions.canUpdate,
        callback: colActions.onUpdate,
        order: 10
      },
      {
        name: 'delete',
        title: this.$t('Delete'),
        type: 'danger',
        has: colActions.hasDelete,
        can: colActions.canDelete,
        callback: colActions.onDelete,
        order: 20
      },
      {
        name: 'clone',
        title: this.$t('Duplicate'),
        type: 'primary',
        has: colActions.hasClone,
        can: colActions.canClone,
        callback: colActions.onClone,
        order: 30
      }
    ]
    return {
      colActions: colActions,
      defaultActions: defaultActions,
      extraActions: colActions.extraActions,
      // moreActionsTitle: colActions.moreActionsTitle || null
      moreActionsTitle: ''
    }
  },
  computed: {
    cleanedActions() {
      let actions = [...this.defaultActions, ...this.extraActions]
      actions = _.cloneDeep(actions)
      actions = actions.map(v => {
        v.has = this.cleanBoolean(v, 'has', true)
        v.can = this.cleanBoolean(v, 'can', true)
        v.callback = this.cleanCallback(v, 'callback')
        v.icon = this.cleanValue(v, 'icon')
        v.order = v.order || 100
        v.tip = this.cleanValue(v, 'tip')
        v.title = this.cleanValue(v, 'title')
        return v
      })
      actions = actions.filter(v => v.has)
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
      return this.cleanedActions.slice(1, this.cleanedActions.length)
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
    cleanCallback(item, attr) {
      const callback = item[attr]
      const attrs = {
        reload: this.reload,
        row: this.row,
        col: this.col,
        cellValue: this.cellValue,
        tableData: this.tableData
      }
      return () => {
        return callback.bind(this)(attrs)
      }
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
.table-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  font-style: normal;

  :deep(.data-actions.layout) {
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-button) {
    height: 28px;
    min-height: 28px;
    padding: 0 var(--space-2);
    border-radius: var(--radius-control);
    font-style: normal;
    line-height: 1;
  }

  :deep(.el-button--primary:not(.is-plain):not(.is-text):not(.is-link)) {
    color: #ffffff;
  }

  :deep(.data-actions.layout .action-item.el-dropdown) {
    display: inline-flex;
    align-items: center;
    margin-left: 0;
  }

  :deep(.data-actions.layout .action-item.el-dropdown .more-action) {
    width: 28px;
    min-width: 28px;
    height: 28px;
    min-height: 28px;
    padding: 0;
    color: var(--N600) !important;
    border: 1px solid var(--N300) !important;
    background: var(--surface-panel) !important;
    box-shadow: none !important;
    border-radius: var(--radius-control);
  }

  :deep(.data-actions.layout.table-actions .action-item.el-dropdown .more-action) {
    border-color: var(--N300) !important;
    background: var(--surface-panel) !important;
  }

  :deep(.data-actions.layout.table-actions .action-item.el-dropdown .more-action:hover),
  :deep(.data-actions.layout.table-actions .action-item.el-dropdown .more-action:focus-visible) {
    border-color: var(--N400) !important;
    background: var(--N50) !important;
    color: var(--N900) !important;
  }

  :deep(.data-actions.layout .action-item.el-dropdown .more-action:hover),
  :deep(.data-actions.layout .action-item.el-dropdown .more-action:focus-visible) {
    color: var(--N900) !important;
    border-color: var(--N400) !important;
    background: var(--N50) !important;
    box-shadow: none !important;
  }

  :deep(.data-actions.layout .action-item.el-dropdown .more-action:active) {
    color: var(--color-primary) !important;
    background: rgba(26, 179, 148, 0.12) !important;
    box-shadow: none !important;
  }

  :deep(.data-actions.layout .action-item.el-dropdown .more-action .action-content) {
    width: 100%;
    height: 100%;
    justify-content: center;
    gap: 0;
  }

  :deep(.svg-icon),
  :deep(.el-icon),
  :deep([class^='el-icon-']),
  :deep([class*=' el-icon-']),
  :deep(.fa) {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 0 !important;
    font-size: 14px;
    line-height: 14px;
  }

  :deep(.fa) {
    font-family: FontAwesome !important;
  }

  :deep([class^='el-icon-']),
  :deep([class*=' el-icon-']) {
    font-family: element-icons !important;
  }

  :deep(.el-icon-arrow-down) {
    display: none;
  }
}
</style>
