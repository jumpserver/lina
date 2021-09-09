<template>
  <el-row :gutter="20">
    <el-col :span="20">
      <AppAccountListTable ref="ListTable" :url="accountUrl" :has-import="false" :has-clone="false" />
    </el-col>
    <el-col :span="4" />
  </el-row>
</template>

<script>

import { AppAccountListTable } from '@/components'

export default {
  name: 'AccountList',
  components: {
    AppAccountListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      accountUrl: `/api/v1/applications/accounts/?systemuser=${this.object.id}`
    }
  }
}
</script>

<style lang='less' scoped>

</style>
