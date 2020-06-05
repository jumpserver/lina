<template>
  <ActionsGroup v-loading="loadStatus" :size="'mini'" :actions="actions" :more-actions="moreActions" />
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
  const msg = this.$t('common.deleteWarningMsg') + ' "' + `${row.name || row.hostname}` + '"'
  const title = this.$t('common.Info')
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
        this.$message.success(this.$t('common.deleteSuccessMsg'))
      } catch (error) {
        this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + error))
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
    const colActions = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    const defaultActions = [
      {
        name: 'update',
        title: this.$t('common.Update'),
        type: 'primary',
        has: colActions.hasUpdate,
        can: colActions.canUpdate,
        callback: colActions.onUpdate
      },
      {
        name: 'delete',
        title: this.$t('common.Delete'),
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
      actions = _.cloneDeep(actions)
      actions = actions.map((v) => {
        v.has = this.cleanBoolean(v, 'has')
        v.can = this.cleanBoolean(v, 'can')
        v.fa = this.cleanFa(v, 'fa')
        v.callback = this.cleanCallback(v)
        return v
      })
      actions = actions.filter((v) => v.has)
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
    loadStatus() {
      return this.col.formatterArgs.loading
    }
  },
  methods: {
    cleanBoolean(item, attr) {
      const ok = item[attr]
      if (typeof ok !== 'function') {
        return ok === undefined ? true : ok
      }
      return ok(this.row, this.cellValue)
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
    },
    cleanFa(item, attr) {
      const ok = item[attr]
      if (typeof ok !== 'function') {
        return ok === undefined ? false : ok
      }
      return ok(this.row, this.cellValue)
    }
  }
}
</script>

<style scoped>

</style>
