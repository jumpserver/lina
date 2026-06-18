<template>
  <div class="json-editor">
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
import { javascript } from '@codemirror/legacy-modes/mode/javascript'

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
      extensions: [basicSetup, StreamLanguage.define(javascript({ json: true }))]
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
    handleBlur() {
      try {
        this.editorValue = JSON.stringify(this.parseEditorValue(), null, 2)
      } catch (error) {
        this.$message.error(this.$tc('FormatError'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.json-editor {
  .resize :deep(.cm-editor) {
    resize: vertical;
    overflow: auto;
  }

  :deep(.cm-editor) {
    min-height: 240px;
    border: 1px solid #e5e6e7;
    border-radius: 4px;
  }

  :deep(.cm-focused) {
    outline: none;
    border-color: var(--color-primary);
  }

  :deep(.cm-scroller) {
    min-height: 240px;
    font-family: Monaco, Menlo, Consolas, 'Courier New', monospace;
    font-size: 12px;
  }
}
</style>
