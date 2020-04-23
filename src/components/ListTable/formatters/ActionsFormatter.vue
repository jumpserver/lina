<template>
  <ActionsGroup :size="'mini'" :actions="actions" :more-actions="moreActions" />
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup/index'
import BaseFormatter from './base'

const defaultPerformDelete = function({ row, col }) {
  const id = row.id
  const url = `${this.url}${id}/`
  return this.$axios.delete(url)
}
const defaultUpdateCallback = function({ row, col }) {
  const id = row.id
  const routeName = this.colActions.updateRoute
  this.$router.push({ name: routeName, params: { id: id }})
}

const defaultDeleteCallback = function({ row, col, cellValue, reload }) {
  const msg = this.$tc('Are you sure to delete') + ' "' + row.name + '"'
  const title = this.$tc('Info')
  const performDelete = this.colActions.performDelete
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
        this.$message.success(this.$tc('Delete success'))
      } catch (error) {
        this.$message.error(this.$tc('Delete failed' + ' ' + error))
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
    actionsDefault: {
      type: Object,
      default: function() {
        return {
          hasUpdate: true, // can set function(row, value)
          canUpdate: true, // can set function(row, value)
          hasDelete: true, // can set function(row, value)
          canDelete: true,
          updateRoute: this.$route.name.replace('List', 'Update'),
          performDelete: defaultPerformDelete,
          onUpdate: defaultUpdateCallback,
          onDelete: defaultDeleteCallback,
          extraActions: [] // format see defaultActions
        }
      }
    }
  },
  data() {
    const colActions = Object.assign(this.actionsDefault, this.col.actions)
    const defaultActions = [
      {
        name: 'update',
        title: this.$tc('Update'),
        type: 'primary',
        has: colActions.hasUpdate,
        can: colActions.canUpdate,
        callback: colActions.onUpdate
      },
      {
        name: 'delete',
        title: this.$tc('Delete'),
        type: 'danger',
        has: colActions.hasDelete,
        can: colActions.canDelete,
        callback: colActions.onDelete
      }
    ]
    return {
      colActions: colActions,
      defaultActions: defaultActions,
      extraActions: colActions.extraActions
    }
  },
  computed: {
    cleanedActions() {
      let actions = [...this.defaultActions, ...this.extraActions]
      actions = actions.map((v) => {
        v.has = this.cleanAction(v, 'has')
        v.can = this.cleanAction(v, 'can')
        v.callback = this.cleanCallback(v)
        return v
      })
      return actions
    },
    actions() {
      return this.cleanedActions.slice(0, 2)
    },
    moreActions() {
      return this.cleanedActions.slice(2, this.cleanedActions.length)
    }
  },
  mounted() {
    this.$log.debug('actions', this.actions)
    this.$log.debug('moreActions', this.moreActions)
  },
  methods: {
    cleanAction(item, attr) {
      const ok = item[attr]
      if (!ok || typeof ok !== 'function') {
        return item
      }
      item.ok = function() {
        return ok(this.row, this.cellValue)
      }
      return item
    },
    cleanCallback(item) {
      const callback = item.callback
      const attrs = {
        reload: this.reload,
        row: this.row,
        col: this.col,
        cellValue: this.cellValue,
        tableData: this.tableData
      }
      return () => { return callback.bind(this)(attrs) }
    }
  }
}
</script>

<style scoped>

</style>
