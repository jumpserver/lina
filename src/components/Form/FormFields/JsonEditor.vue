<template>
  <div class="json-editor">
    <div class="json-editor-toolbar">
      <el-tooltip :content="$t('Format')" placement="top" :open-delay="300">
        <button type="button" class="format-btn" @click="formatJson">
          <svg class="format-icon" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="1" y="2.3" width="14" height="1.4" rx="0.7" />
            <rect x="4" y="6" width="11" height="1.4" rx="0.7" />
            <rect x="4" y="9.6" width="11" height="1.4" rx="0.7" />
            <rect x="1" y="13.3" width="14" height="1.4" rx="0.7" />
          </svg>
        </button>
      </el-tooltip>
    </div>
    <codemirror
      v-model="editorValue"
      :class="{ resize: resize === 'vertical' }"
      :extensions="extensions"
      :style="editorStyle"
      class="editor"
      @blur="handleBlur"
    />
  </div>
</template>

<script>
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from 'codemirror'
import { StreamLanguage } from '@codemirror/language'
import { json } from '@codemirror/legacy-modes/mode/javascript'
import { markRaw } from 'vue'

function stringifyValue(value) {
  if (typeof value === 'string') {
    return value
  }
  if (value === null || typeof value === 'undefined') {
    return ''
  }
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return ''
  }
}

export default {
  name: 'JsonEditor',
  components: {
    codemirror: Codemirror
  },
  props: {
    value: {
      type: [String, Object, Array],
      default: () => ({})
    },
    resize: {
      type: String,
      validator: (value) => ['none', 'vertical'].includes(value),
      default: 'vertical'
    }
  },
  emits: ['change'],
  data() {
    return {
      editorValue: stringifyValue(this.value),
      emitTimer: null,
      // 该版本 legacy-modes 的 json/javascript 导出已是 StreamParser 对象（非函数），
      // 直接传给 StreamLanguage.define；JSON 编辑器使用 json 模式。
      // markRaw：CodeMirror 6 的 extension 实例靠对象身份去重，若被 Vue 响应式
      // Proxy 包裹会导致 lineNumbers 等 gutter 无法去重而重复渲染（行号出现多列）。
      extensions: markRaw([basicSetup, StreamLanguage.define(json)])
    }
  },
  computed: {
    editorStyle() {
      return {
        minHeight: '240px'
      }
    }
  },
  watch: {
    value: {
      deep: true,
      handler(newValue) {
        const nextValue = stringifyValue(newValue)
        if (nextValue !== this.editorValue) {
          this.editorValue = nextValue
        }
      }
    },
    editorValue() {
      this.queueEmit()
    }
  },
  beforeUnmount() {
    if (this.emitTimer) {
      clearTimeout(this.emitTimer)
    }
  },
  methods: {
    parseEditorValue() {
      if (!this.editorValue.trim()) {
        return {}
      }
      return JSON.parse(this.editorValue)
    },
    queueEmit() {
      if (this.emitTimer) {
        clearTimeout(this.emitTimer)
      }
      this.emitTimer = setTimeout(() => {
        try {
          this.$emit('change', this.parseEditorValue())
        } catch (error) {
          this.$message.error(this.$tc('FormatError'))
        }
      }, 300)
    },
    formatJson() {
      try {
        this.editorValue = JSON.stringify(this.parseEditorValue(), null, 2)
      } catch (error) {
        this.$message.error(this.$tc('FormatError'))
      }
    },
    handleBlur() {
      this.formatJson()
    }
  }
}
</script>

<style lang="scss" scoped>
.json-editor {
  // DataForm 的 .el-form-item__content 是 flex 列且 align-items: flex-start，
  // 交叉轴不拉伸，容器需显式占满宽度，否则 CodeMirror 编辑器宽度会塌缩。
  width: 100%;
  // 工具栏与编辑器组合为一体：外层统一出边框，内部子元素不再各自描边。
  border: 1px solid #e5e6e7;
  border-radius: 4px;
  overflow: hidden;

  &:focus-within {
    border-color: var(--color-primary);
  }

  .json-editor-toolbar {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 32px;
    padding: 0 8px;
    background-color: #f5f6f7;
    border-bottom: 1px solid #e5e6e7;

    .format-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: 3px;
      background: transparent;
      cursor: pointer;
      // 用具体色值而非 CSS 变量，避免变量未解析导致图标“透明”只在 hover 才显形。
      color: #606266;

      &:hover {
        background-color: #e9eaec;
        color: var(--color-primary, #1ab394);
      }

      .format-icon {
        width: 15px;
        height: 15px;
        fill: currentColor;
        display: block;
      }
    }
  }

  .resize :deep(.cm-editor) {
    resize: vertical;
    overflow: auto;
  }

  // 用确定高度（而非 min-height）：CodeMirror 的 .cm-gutters 自带 height:100%，
  // 需相对一个有确定高度的父级才能解析。若用 min-height，scroller 高度由内容撑开，
  // gutter 的 100% 解析不出整高，背景只到内容底部而下方留白。height 固定后即可撑满，
  // 内容超出时由 .cm-scroller 内部滚动；配合 resize: vertical 仍可手动拖高。
  // 边框由外层 .json-editor 统一承担，这里不再描边。
  :deep(.cm-editor) {
    height: 240px;
  }

  :deep(.cm-focused) {
    outline: none;
  }

  :deep(.cm-scroller) {
    font-family: Monaco, Menlo, Consolas, 'Courier New', monospace;
    font-size: 12px;
  }
}
</style>
