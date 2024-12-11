<template>
  <div>
    <AccountTemplateTable />

    <Drawer v-if="showTableUpdateDrawer" :title="drawerTitle" @close-drawer="showTableUpdateDrawer = !showTableUpdateDrawer">
      <component :is="currentTemplate" />
    </Drawer>
  </div>
</template>

<script>
import Drawer from '@/components/Drawer/index.vue'
import AccountTemplateTable from '@/views/accounts/AccountTemplate/AccountTemplateTable.vue'
// import AccountTemplateDetail from '@/views/accounts/AccountTemplate/AccountTemplateDetail/index.vue'

export default {
  name: 'AccountTemplateList',
  components: {
    AccountTemplateTable,
    Drawer,
    AccountTemplateUpdate: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue')
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
