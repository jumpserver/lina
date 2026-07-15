<template>
  <div class="markdown-editor">
    <div class="action-bar">
      <i class="fa" :class="[showPreview ? 'fa-eye-slash' : 'fa-eye']" @click="togglePreview" />
    </div>
    <div class="editor-scroll">
      <el-row :gutter="12" :class="{ 'is-split': showPreview }" class="editor-panes">
        <el-col :span="showPreview ? 12 : 24" class="editor-pane">
          <el-input
            v-model="localValue"
            :autosize="{ minRows: 16 }"
            class="editor-input"
            type="textarea"
          />
        </el-col>
        <el-col v-show="showPreview" :span="12" class="editor-pane">
          <div class="preview markdown-body" v-html="html" />
        </el-col>
      </el-row>
    </div>
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
  // 表单项内容区是 flex 容器,不设宽度会按内容收缩成窄条,这里撑满可用宽度
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
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

.editor-scroll {
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.editor-panes {
  flex-wrap: nowrap;
}

.editor-panes.is-split {
  flex-wrap: wrap;
  row-gap: 12px;
}

.editor-pane {
  min-width: 0;
}

.editor-panes.is-split .editor-pane {
  flex: 1 1 280px;
  width: auto;
  max-width: 100%;
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
