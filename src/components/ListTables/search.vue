<template>
  <div>
    <el-input v-model="input" placeholder="搜索..." class="input-with-select" size="small" clearable @input="serachAction">
      <el-button slot="append" icon="el-icon-search" />
    </el-input>
  </div>
</template>

<script>
export default {
  data() {
    return {
      input: ''
    }
  },
  methods: {
    serachAction(val) {
      this.$emit('serachAction', val)
    }
  }
}
</script>

<style lang="less" scoped>

</style>

