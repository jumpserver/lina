<template>
  <DataActions :actions="iActions" v-bind="$attrs" />
</template>

<script>
import DataActions from '@/components/DataActions'
export default {
  name: 'ActionsGroup',
  components: {
    DataActions
  },
  props: {
    actions: {
      type: Array,
      default: () => []
    },
    moreActions: {
      type: Array,
      default: () => []
    },
    moreActionsTitle: {
      type: String,
      default() {
        return this.$t('common.MoreActions')
      }
    },
    moreActionsType: {
      type: String,
      default: 'default'
    },
    moreActionsPlacement: {
      type: String,
      default: 'bottom'
      // 居中对齐
    }
  },
  computed: {
    iActions() {
      const actions = [...this.actions]
      if (this.iMoreAction && this.iMoreAction.dropdown.length > 0) {
        actions.push(this.iMoreAction)
      }
      return actions
    },
    iMoreAction() {
      return {
        name: 'moreActions',
        title: this.iMoreActionsTitle,
        dropdown: this.moreActions || []
      }
    },
    iMoreActionsTitle() {
      return this.moreActionsTitle || this.$t('common.MoreActions')
    }
  }
}
</script>

<style scoped>

</style>
