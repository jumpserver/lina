<template>
  <ActionsGroup :size="'mini'" :actions="actions" @actionClick="handleActionClick"></ActionsGroup>
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup'
import BaseFormatter from './base'
export default {
  name: 'ActionsFormatter',
  components: { ActionsGroup },
  extends: BaseFormatter,
  data() {
    const actions = []
    let hasUpdate = this.col.actions.hasUpdate
    if (typeof this.col.actions.hasUpdate === 'function') {
      hasUpdate = this.col.actions.hasUpdate(this.row, this.cellValue)
    }
    if (hasUpdate) {
      let canUpdate = this.col.actions.canUpdate
      if (typeof this.col.actions.canUpdate === 'function') {
        canUpdate = this.col.actions.canUpdate(this.row, this.cellValue)
      }
      actions.push({
        name: 'edit',
        title: this.$tc('Update'),
        type: 'primary',
        disabled: !canUpdate
      })
    }

    let hasDelete = this.col.actions.hasDelete
    if (typeof this.col.actions.hasDelete === 'function') {
      hasDelete = this.col.actions.hasDelete(this.row, this.cellValue)
    }
    if (hasDelete) {
      let canDelete = this.col.actions.canDelete
      if (typeof this.col.actions.canDelete === 'function') {
        canDelete = this.col.actions.canDelete(this.row, this.cellValue)
      }
      actions.push({
        name: 'delete',
        title: this.$tc('Delete'),
        type: 'danger',
        disabled: !canDelete
      })
    }
    return {
      actions: actions
    }
  },
  methods: {
    handleActionClick(item) {
      this.emit('actionClick', item, this.row, this.col, this.cellValue)
    }
  }
}
</script>

<style scoped>

</style>
