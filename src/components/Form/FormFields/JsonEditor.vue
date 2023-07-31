<template>
  <div class="json-editor">
    <JsonEditor
      v-model="resultInfo"
      :mode="'code'"
      :show-btns="false"
      :class="{resize: resize === 'vertical'}"
      @json-change="onJsonChange"
      @json-save="onJsonSave"
      @has-error="onError"
    />
  </div>
</template>

<script>
import JsonEditor from 'vue-json-editor'

export default {
  components: { JsonEditor },
  props: {
    value: {
      type: [String, Object, Array],
      default: () => ({})
    },
    resize: {
      type: String,
      validator: (value) => {
        return ['none', 'vertical'].indexOf(value) !== -1
      },
      default: 'vertical'
    }
  },
  data() {
    return {
      hasJsonFlag: true, // json是否验证通过
      resultInfo: {}
    }
  },
  created() {
    this.resultInfo = typeof this.value === 'string' ? JSON.parse(this.value) : this.value
  },
  methods: {
    // 数据改变
    onJsonChange(value) {
      this.onJsonSave(value)
    },
    // 保存
    onJsonSave(value) {
      this.resultInfo = typeof value === 'string' ? JSON.parse(value) : value
      this.hasJsonFlag = true
      setTimeout(() => {
        this.$emit('change', this.resultInfo)
      }, 500)
    },
    onError: _.debounce(function(value) {
      this.$message.error(this.$tc('common.FormatError'))
    }, 1500)
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables";

  .json-editor {
    .resize {
      & > > > .jsoneditor {
      resize: vertical;
      cursor: s-resize;
      }
    }
    & > > > .jsoneditor {
      border: 1px solid #e5e6e7;
    }

    & > > > .jsoneditor-compact {
      display: none;
    }

    & > > > .jsoneditor-modes {
      display: none;
    }

    & > > > .jsoneditor-poweredBy {
      display: none;
    }

    & > > > .jsoneditor-menu {
      background: var(--color-primary);
      border-bottom: 1px solid var(--color-primary);
    }
  }
</style>
