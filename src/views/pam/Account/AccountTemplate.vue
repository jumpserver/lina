<template>
  <AccountTemplateTable />
</template>

<script>
import AccountTemplateTable from '@/views/accounts/AccountTemplate/AccountTemplateTable.vue'

export default {
  name: 'AccountTemplateList',
  components: {
    AccountTemplateTable
  },
  data() {
    return {
      currentTemplate: null,
      showTableUpdateDrawer: false,
      drawerTitle: '',
      account: {},
      secretUrl: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.page ::v-deep .page-heading {
  display: none;
}

::v-deep .ibox {
  height: 100%;

  .el-card__body {
    height: 100%;
    padding-bottom: unset;
  }
}
</style>
