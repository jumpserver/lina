<template>
  <div class="markdown-editor">
    <div class="action-bar">
      <i
        class="fa"
        :class="[showPreview ? 'fa-eye-slash' : 'fa-eye']"
        @click="togglePreview"
      />
    </div>
    <el-row :gutter="12">
      <el-col :span="showPreview ? 12 : 24">
        <el-input
          v-model="localValue"
          :autosize="{ minRows: 16 }"
          class="editor-input"
          type="textarea"
        />
      </el-col>
      <el-col v-show="showPreview" :span="12">
        <div class="preview markdown-body" v-html="html" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'

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
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      localValue: this.value,
      showPreview: true
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
  },
  methods: {
    togglePreview() {
      this.showPreview = !this.showPreview
    }
  }
}
</script>
<style lang="scss" scoped>
.markdown-editor {
  position: relative;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.action-bar {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 1;

  i {
    cursor: pointer;
  }
}

.editor-input :deep(.el-textarea__inner) {
  min-height: 400px !important;
  font-family: Monaco, Menlo, Consolas, 'Courier New', monospace;
}

.preview {
  min-height: 400px;
  padding: 12px;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  @import 'github-markdown-css/github-markdown-light.css';
}
</style>
