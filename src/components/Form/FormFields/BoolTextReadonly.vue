<template>
  <div>
    <span :class="iClasses">
      <i v-if="iIcon" :class="'fa ' + iIcon" />
    </span>
    <span v-if="iText"> {{ iText }} </span>
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
    },
    trueIcon: {
      type: String,
      default: function() {
        return 'fa-check-circle'
      }
    },
    falseIcon: {
      type: String,
      default: function() {
        return ''
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    iText() {
      return this.value ? this.trueText : this.falseText
    },
    iIcon() {
      return this.value ? this.trueIcon : this.falseIcon
    },
    iClasses() {
      return this.value ? 'text-primary' : ''
    }
  }
}
</script>

<style scoped>

</style>
