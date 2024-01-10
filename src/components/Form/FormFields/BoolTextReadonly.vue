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
        return this.$t('Yes')
      }
    },
    falseText: {
      type: String,
      default: function() {
        return this.$t('No')
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
