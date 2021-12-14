<template>
  <div class="json-editor">
    <JsonEditor
      v-model="resultInfo"
      :show-btns="false"
      :mode="'code'"
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
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      hasJsonFlag: true, // json是否验证通过
      resultInfo: {}
    }
  },
  created() {
    this.resultInfo = JSON.parse(this.value)
  },
  methods: {
    // 数据改变
    onJsonChange(value) {
      this.onJsonSave(value)
    },
    // 保存
    onJsonSave(value) {
      this.resultInfo = value
      this.hasJsonFlag = true
      setTimeout(() => {
        this.$emit('change', JSON.stringify(this.resultInfo))
      }, 500)
    },
    onError: _.debounce(function(value) {
      this.$message.error(this.$t('common.FormatError'))
    }, 1100)
  }
}
</script>

<style lang="scss" scoped>
  .json-editor {
    &>>> .jsoneditor {
      border: 1px solid #e5e6e7;
    }
    &>>> .jsoneditor-compact {
      display: none;
    }
    &>>> .jsoneditor-modes {
      display: none;
    }
    &>>> .jsoneditor-poweredBy {
      display: none;
    }
    &>>> .jsoneditor-menu {
      background: #1ab394;
      border-bottom: 1px solid #1ab394;
    }
  }
</style>
