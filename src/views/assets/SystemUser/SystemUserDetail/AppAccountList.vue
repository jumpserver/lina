<template>
  <el-row :gutter="20">
    <el-col :md="20" :sm="24">
      <AppAccountListTable
        ref="ListTable"
        :url="accountUrl"
        :has-import="false"
        :has-clone="false"
        :system-user-disabled="systemUserDisabled"
      />
    </el-col>
    <el-col :md="4" :sm="24" />
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
      accountUrl: `/api/v1/applications/accounts/?systemuser=${this.object.id}`,
      systemUserDisabled: false
    }
  }
}
</script>

<style lang='less' scoped>

</style>
