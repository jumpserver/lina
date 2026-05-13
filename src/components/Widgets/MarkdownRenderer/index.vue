<template>
  <div v-if="show" class="markdown-renderer" v-html="renderedHtml" />
</template>

<script>
import 'highlight.js/styles/atom-one-light.css'
import { renderMarkdown } from '@/utils/markdown'

export default {
  name: 'MarkdownRenderer',
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
      return renderMarkdown(this.source, { html: this.html })
    }
  }
}
</script>
