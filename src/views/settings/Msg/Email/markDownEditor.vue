<template>
  <div class="markdown-editor">
    <VueMarkdownEditor
      v-model="localValue"
      :left-toolbar="leftToolbar"
      :right-toolbar="rightToolbar"
      height="400px"
    />
  </div>
</template>

<script>
import VueMarkdownEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'

VueMarkdownEditor.use(vuepressTheme, { Prism })

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

function renderHtml(source) {
  return DOMPurify.sanitize(markdown.render(source || ''))
}

export default {
  name: 'RichEditor',
  components: { VueMarkdownEditor },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      localValue: this.value,
      leftToolbar: 'undo redo clear | h bold italic strikethrough quote | ul ol hr | link code',
      rightToolbar: 'preview sync-scroll fullscreen'
    }
  },
  computed: {
    html() {
      return renderHtml(this.localValue)
    }
  },
  watch: {
    value(val) {
      if (val !== this.localValue) {
        this.localValue = val
      }
    },
    localValue(val) {
      this.$emit('input', val)
      this.$emit('htmlChange', this.html)
    }
  },
  mounted() {
    this.$emit('htmlChange', this.html)
  }
}
</script>

<style lang="scss" scoped>
.markdown-editor {
  width: 100%;
  min-width: 0;
  border: 1px solid #ccc;
  box-sizing: border-box;
  padding: 10px;
}
</style>
