<template>
  <ActionsGroup :actions="tActions" :more-actions="tMoreActions" @clickAction="handleClickAction" class="header-action"></ActionsGroup>
</template>

<script>
import ActionsGroup from '../ActionsGroup'
export default {
  name: 'HeaderActions',
  components: {
    ActionsGroup
  },
  props: {
    actions: {
      type: Array,
      default: () => []
    },
    moreActions: {
      type: Array,
      default: () => ([])
    },
    hasSelection: {
      type: Boolean,
      default: () => true
    },
    selectDisable: {
      type: Boolean,
      default: () => true
    }
  },
  data() {
    return {
      value: ''
    }
  },
  computed: {
    tActions() {
      console.log('actions', this.actions)
      return this.actions
    },
    tMoreActions() {
      console.log(this.moreActions)
      return this.moreActions
    }
  },
  methods: {
    handleClickAction(item) {
      console.log(this)
      this.$emit('clickAction', item)
    },
    handleAction() {
      this.$emit('actionClick', this.value)
    }
  }
}
</script>

<style lang="less" scoped>

</style>

