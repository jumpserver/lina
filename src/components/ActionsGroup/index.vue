<template>
  <DataActions :actions="iActions" v-bind="$attrs" @dropdownVisibleChange="dropdownVisibleChange" />
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
    moreActionBtn: {
      type: Object,
      default: () => ({})
    },
    moreActionsTitle: {
      type: String,
      default() {
        return this.$t('common.MoreActions')
      }
    },
    moreActionsPlacement: {
      type: String,
      default: 'bottom'
      // 居中对齐
    }
  },
  data() {
    return {
      defaultMoreActions: this.moreActions
    }
  },
  computed: {
    iRow() {
      return this.row
    },
    iActions() {
      const actions = [...this.actions]
      if (this.iMoreAction && this.iMoreAction.dropdown.length > 0) {
        actions.push(this.iMoreAction)
      }
      return actions
    },
    iMoreAction() {
      const defaultBtn = {
        name: 'moreActions',
        title: this.$t('common.MoreActions'),
        type: 'primary',
        plain: true
      }
      const btn = {
        ...defaultBtn,
        ...this.moreActionBtn,
        dropdown: this.moreActions || []
      }
      if (this.moreActionsTitle) {
        btn.title = this.moreActionsTitle
      }
      return btn
    }
  },
  methods: {
    dropdownVisibleChange(status, action) {
      this.defaultMoreActions = action?.dropdown
    }
  }
}
</script>

<style scoped>

</style>
