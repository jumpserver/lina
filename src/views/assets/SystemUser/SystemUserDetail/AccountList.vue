<template>
  <el-row :gutter="20">
    <el-col :span="20">
      <AccountListTable ref="ListTable" :url="assetUserUrl" :has-import="false" :has-clone="false" />
    </el-col>
    <el-col :span="4" />
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
      assetUserUrl: `/api/v1/assets/accounts/?systemuser=${this.object.id}`
    }
  },
  computed: {
  }
}
</script>

<style lang='less' scoped>

</style>
