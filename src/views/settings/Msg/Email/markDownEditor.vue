<template>
  <div>
    <el-row :gutter="12">
      <el-col :span="12">
        <el-input
          v-model="localValue"
          type="textarea"
          :rows="18"
          resize="vertical"
        />
      </el-col>
      <el-col :span="12">
        <div class="preview-box markdown-body" v-html="html" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { renderMarkdown } from '@/utils/markdown'

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
      localValue: this.value
    }
  },
  computed: {
    html() {
      return renderMarkdown(this.localValue)
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
  }
}
</script>

<style scoped lang="scss">
.preview-box {
  min-height: 388px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 2px;
  overflow: auto;
  background: #fff;
  @import "~github-markdown-css/github-markdown-light.css";
}
</style>
