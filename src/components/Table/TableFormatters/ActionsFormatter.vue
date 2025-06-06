<template>
  <ActionsGroup
    v-loading="loadingStatus"
    :actions="actions"
    :more-actions="moreActions"
    :more-actions-title="moreActionsTitle"
    :size="'mini'"
    class="table-actions"
  />
</template>

<script>
import BaseFormatter from './base.vue'
import ActionsGroup from '@/components/Common/ActionsGroup/index.vue'

const defaultPerformDelete = function({ row, col }) {
  const id = row.id
  const url = new URL(this.url, location.origin)
  url.pathname += `${id}/`
  const deleteUrl = url.href
  return this.$axios.delete(deleteUrl)
}

const defaultUpdateCallback = function({ row, col }) {
  const id = row.id
  let route = { params: { id: id }}
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
  let route = { params: { id: id }}
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
  let route = { query: { clone_from: id }}
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
    beforeClose: async(action, instance, done) => {
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
          updateRoute: this.$route.name.replace('List', 'Update'),
          cloneRoute: this.$route.name.replace('List', 'Create'),
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
      actions = actions.map((v) => {
        v.has = this.cleanBoolean(v, 'has', true)
        v.can = this.cleanBoolean(v, 'can', true)
        v.callback = this.cleanCallback(v, 'callback')
        v.icon = this.cleanValue(v, 'icon')
        v.order = v.order || 100
        v.tip = this.cleanValue(v, 'tip')
        v.title = this.cleanValue(v, 'title')
        return v
      })
      actions = actions.filter((v) => v.has)
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
  ::v-deep {
    .el-icon-arrow-down {
      display: none;
    }
  }
}
</style>
