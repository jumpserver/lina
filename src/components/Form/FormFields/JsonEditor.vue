<template>
  <div class="json-editor">
    <div class="json-editor-toolbar">
      <el-tooltip :content="$t('Format')" placement="top" :show-after="300">
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
import _isEqual from 'lodash/isEqual'

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
      // JSON 顶层可以是任意合法值(数组/对象/字符串/数字/布尔/null),
      // 若只声明 String|Object|Array,用户输入 123/true 等回灌时会触发类型告警。
      type: [String, Object, Array, Number, Boolean],
      default: () => ({})
    },
    resize: {
      type: String,
      validator: (value) => ['none', 'vertical'].includes(value),
      default: 'vertical'
    }
  },
  // 声明 input / update:modelValue：DataForm 的 render-form-item 会向每个字段组件
  // 透传 input 处理器。若不在 emits 里声明，Vue 会把 onInput 当作原生 DOM 监听器
  // 落到根 <div> 上,而 CodeMirror 的 contenteditable 每次按键都会冒泡原生 input 事件,
  // 于是原始事件对象被当成字段值写回(显示为 {"isTrusted":true,"_vts":...})。
  // 声明后 Vue 将其视为组件事件(本组件从不 $emit),从而不再作为原生监听器透传。
  emits: ['change', 'input', 'update:modelValue'],
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
        // 语义相等则保留用户手写的原始文本(含换行/缩进),不做回灌覆盖。
        // 否则用户敲 "[\n]" 停顿后本组件 emit 出 [],父级回灌 [] → stringify 成 "[]"
        // 与 "[\n]" 文本不等被覆盖,表现为"换行后自动塌回 []"。
        try {
          if (_isEqual(this.parseEditorValue(), newValue)) {
            return
          }
        } catch (e) {
          // 当前文本非法 JSON,按下方常规逻辑用回灌值重写
        }
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
          // 输入过程中(如刚敲了半个对象)文本暂时非法是正常现象,静默跳过,
          // 不弹"格式错误"打断输入;失焦(handleBlur)时再统一校验并提示。
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
      // 失焦时只校验合法性并提交,不再自动重排格式——否则用户手写的
      // "[\n]" 等换行会被 JSON.stringify 塌缩回 "[]"。需要规整时点工具栏的格式化按钮。
      if (!this.editorValue.trim()) {
        return
      }
      try {
        const parsed = this.parseEditorValue()
        this.$emit('change', parsed)
      } catch (error) {
        this.$message.error(this.$tc('FormatError'))
      }
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
        color: var(--color-primary);
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
