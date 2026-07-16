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
      default: function () {
        return 'Yes'
      }
    },
    falseText: {
      type: String,
      default: function () {
        return 'No'
      }
    },
    trueIcon: {
      type: String,
      default: function () {
        return 'fa-check-circle'
      }
    },
    falseIcon: {
      type: String,
      default: function () {
        return ''
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    iText() {
      const text = this.value ? this.trueText : this.falseText
      // trueText/falseText 默认为 'Yes'/'No',走 i18n 翻译(后端下发的翻译已合并进 vue-i18n);
      // 缺键时 $t 原样返回,不影响自定义文案
      return text ? this.$t(text) : text
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

<style scoped></style>
