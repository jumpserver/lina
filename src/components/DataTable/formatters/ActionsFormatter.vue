<template>
  <ActionsGroup :size="'mini'" :actions="actions" :more-actions="moreActions" @actionClick="handleActionClick"></ActionsGroup>
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup'
import BaseFormatter from './base'
export default {
  name: 'ActionsFormatter',
  components: { ActionsGroup },
  extends: BaseFormatter,
  data() {
    const defaultActions = [
      {
        name: 'update',
        title: this.$tc('Update'),
        type: 'primary',
        has: this.col.actions.hasUpdate || true,
        can: this.col.actions.canUpdate || true,
        callback: this.col.actions.onUpdate
      },
      {
        name: 'delete',
        title: this.$tc('Delete'),
        type: 'danger',
        has: this.col.actions.hasDelete || true,
        can: this.col.actions.canDelete || true,
        callback: this.col.actions.onDelete
      }
    ]
    const extraActions = this.col.actions.extraActions || []
    return {
      defaultActions: defaultActions,
      extraActions: extraActions
    }
  },
  computed: {
    validActions() {
      const actions = [...this.defaultActions, ...this.extraActions]
      const validActions = []
      for (const v of actions) {
        const has = this.checkItem(v, 'has')
        if (!has) {
          continue
        }
        const can = this.checkItem(v, 'can')
        v.disabled = !can
        validActions.push(v)
      }
      return validActions
    },
    actions() {
      return this.validActions.slice(0, 2)
    },
    moreActions() {
      return this.validActions.slice(2, this.validActions.length)
    },
    namedValidActions() {
      const actions = {}
      for (const action of this.validActions) {
        if (!action || !action.hasOwnProperty('name')) {
          continue
        }
        actions[action.name] = action
      }
      return actions
    }
  },
  methods: {
    handleActionClick(item) {
      const action = this.namedValidActions[item]
      if (action && action.callback) {
        console.log(this.setting)
        action.callback(this.row, this.col, this.cellValue)
      }
    },
    checkItem(item, attr) {
      let ok = item[attr]
      if (typeof ok === 'function') {
        ok = ok(this.row, this.cellValue)
      } else if (ok == null) {
        ok = true
      }
      return ok
    }
  }
}
</script>

<style scoped>

</style>
