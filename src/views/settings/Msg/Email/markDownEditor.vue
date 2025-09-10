<template>
  <div style="border: 1px solid #ccc; padding: 10px;">
    <vue-markdown-editor v-model="localValue" :right-toolbar="rightToolbar" :left-toolbar="leftToolbar" height="400px" />
  </div>
</template>
<script>
import VueMarkdownEditor, { xss } from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import Prism from 'prismjs'

VueMarkdownEditor.use(vuepressTheme, {
  Prism
})

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
      rightToolbar: 'preview  sync-scroll fullscreen',
      leftToolbar: 'undo redo clear | h bold italic strikethrough quote | ul ol hr | link  code '
    }
  },
  computed: {
    html() {
      return xss.process(VueMarkdownEditor.themeConfig.markdownParser.render(this.localValue))
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
    }
  }
}
</script>
