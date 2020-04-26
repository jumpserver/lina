<template>
  <ActionsGroup :size="'mini'" :actions="cleanedActions" :more-actions="cleanMoreActions" />
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup/index'
import BaseFormatter from './base'

export default {
  name: 'CustomActionsFormatterVue',
  components: {
    ActionsGroup
  },
  extends: BaseFormatter,
  computed: {
    cleanedActions() {
      if (this.col.actions.actions instanceof Array) {
        const copy = _.cloneDeep(this.col.actions.actions)
        let actions = [...copy]
        actions = actions.map((v) => {
          v.has = this.checkBool(v, 'has')
          v.can = this.checkBool(v, 'can')
          v.callback = this.cleanCallback(v)
          return v
        })
        return actions
      }
      return []
    },
    cleanMoreActions() {
      if (this.col.actions.extraActions instanceof Array) {
        const copy = _.cloneDeep(this.col.actions.extraActions)
        let actions = [...copy]
        actions = actions.map((v) => {
          v.has = this.checkBool(v, 'has')
          v.can = this.checkBool(v, 'can')
          v.callback = this.cleanCallback(v)
          return v
        })
        return actions
      }
      return []
    }
  },
  methods: {
    checkBool(item, attr, defaults) {
      if (!item) {
        return false
      }
      let ok = item[attr]
      if (ok && typeof ok === 'function') {
        ok = ok(this.row, this.cellValue)
      } else if (ok == null) {
        ok = defaults === undefined ? true : defaults
      }
      return ok
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
