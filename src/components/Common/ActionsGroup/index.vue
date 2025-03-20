<template>
  <DataActions :actions="iActions" v-bind="$attrs" />
</template>

<script>
import DataActions from '@/components/Common/DataActions/index.vue'

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
      default: ''
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
      const defaultBtn = {
        name: 'moreActions',
        title: '',
        type: 'primary',
        icon: 'el-icon-more',
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
  }
}
</script>
