<template>
  <ActionsGroup v-loading="loadStatus" :size="'mini'" :actions="actions" :more-actions="moreActions" />
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup/index'
import BaseFormatter from './base'

export default {
  name: 'LoadingActionsFormatter',
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
