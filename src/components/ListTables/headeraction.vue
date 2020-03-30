<template>
  <div>
    <el-button type="primary" size="small" @click="handleClick">{{ this.$t('users.createUser') }}</el-button>
    <el-select v-if="hasSelection" :disabled="selectDisable" v-model="value" size="small" placeholder="更多操作" style="width:150px; margin-left:10px;">
      <el-option label="批量删除" value="delete" />
      <el-option label="批量更新" value="delete" />
      <el-option label="禁用所选" value="delete" />
      <el-option label="激活所选" value="delete" />
    </el-select>
  </div>
</template>

<script>
export default {
  prop: {

  },
  props: {
    hasSelection: {
      type: Boolean,
      default: () => true
    },
    selectDisable:{
      type:Boolean,
      default:() =>true
    }
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

