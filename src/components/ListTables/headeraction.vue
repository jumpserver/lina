<template>
  <div>
    <el-button type="primary" size="small" @click="handleClick">{{ this.$t('users.createUser') }}</el-button>
    <el-select v-model="value" size="small" placeholder="请选择" style="width:150px; margin-left:10px;">
      <el-option label="批量删除" value="delete" />
    </el-select>
    <el-button style="margin-left:10px;" type="primary" size="small" @click="handleAction">执行</el-button>
  </div>
</template>

<script>
export default {
  prop: {

  },
  data() {
    return {
      value: ''
    }
  },
  methods: {
    handleClick() {
      this.$emit('newClick')
    },
    handleAction() {
      this.$emit('actionClick', this.value)
    }
  }
}
</script>

<style lang="less" scoped>

</style>

