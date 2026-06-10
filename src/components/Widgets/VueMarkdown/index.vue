<template>
  <div v-html="renderedHtml" />
</template>

<script>
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

export default {
  name: 'VueMarkdown',
  props: {
    source: {
      type: String,
      default: ''
    },
    html: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    renderedHtml() {
      if (!this.show) return ''
      md.set({ html: this.html })
      return md.render(this.source || '')
    }
  }
}
</script>
