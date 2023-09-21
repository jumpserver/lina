<template>
  <div class="markdown-body">
    <VueMarkdown :source="value" />
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import 'github-markdown-css/github-markdown-light.css'

export default {
  components: {
    VueMarkdown
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang='scss' scoped>
.markdown-body {
  background-color: #f3f3f3;
}
.markdown-body * {
  padding: 10px;
  color: #1a1a1a;
  font-size: 13px;
}
</style>
