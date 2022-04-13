<template>
  <el-row :gutter="20">
    <el-col :md="20" :sm="24">
      <AccountListTable ref="ListTable" :url="accountUrl" :has-import="false" :has-clone="false" />
    </el-col>
    <el-col :md="4" :sm="24" />
  </el-row>
</template>

<script>

import { AccountListTable } from '@/components'

export default {
  name: 'AccountList',
  components: {
    AccountListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      accountUrl: `/api/v1/assets/accounts/?systemuser=${this.object.id}`
    }
  },
  computed: {
  }
}
</script>

<style lang='less' scoped>

</style>
