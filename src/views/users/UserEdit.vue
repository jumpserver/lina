<template>
  <BackPlayground>
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="审批人">
        <el-input v-model="formInline.user" placeholder="审批人" />
      </el-form-item>
      <el-form-item label="活动区域">
        <el-select v-model="formInline.region" placeholder="活动区域">
          <el-option label="区域一" value="shanghai" />
          <el-option label="区域二" value="beijing" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
  </BackPlayground>
</template>

<script>
import { BackPlayground } from '@/layout/components'
export default {
  components: {
    BackPlayground
  },
  data() {
    return {
      formInline: {
        user: '',
        region: ''
      }
    }
  }
}
</script>

<style>

</style>
