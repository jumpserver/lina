<template>
  <div>
    {{ value? trueText : falseText }}
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Boolean],
      default: () => false
    },
    trueText: {
      type: String,
      default: function() {
        return this.$t('common.Yes')
      }
    },
    falseText: {
      type: String,
      default: function() {
        return this.$t('common.No')
      }
    }

  },
  data() {
    return {}
  }
}
</script>

<style scoped>

</style>
