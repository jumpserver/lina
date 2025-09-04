<template>
  <div style="border: 1px solid #ccc; padding: 10px;">
    <vue-markdown-editor v-model="localValue" height="400px" />
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
      localValue: this.value
    }
  },
  computed: {
    html() {
      return xss.process(VueMarkdownEditor.themeConfig.markdownParser.render(this.localValue))
    }
  },
  watch: {
    value(val) {
      console.log('==========', val)
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
