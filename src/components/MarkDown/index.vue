<template>
  <div class="markdown-body">
    <VueMarkdown :source="value" />
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import 'github-markdown-css/github-markdown.css'

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

<style scoped>

</style>
