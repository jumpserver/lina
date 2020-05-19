<template>
  <el-upload
    v-bind="$attrs"
    @input="onInput"
    v-on="$listeners"
  >
    <el-button size="small" type="primary">点击上传</el-button>
    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
  </el-upload>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: () => ''
    }
  },
  watch: {
    value(value) {
      this.$emit('customEvent', value, 'message')
    }
  },
  methods: {
    onInput(val) {
      this.$emit('input', 'my-input: ' + val)
    }
  }
}
</script>

<style scoped>

</style>
