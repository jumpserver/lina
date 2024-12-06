<template>
  <div>
    <BaseList :table-config="tableConfig" v-bind="config" />
    <Drawer v-if="showTableUpdateDrawer" :title="drawerTitle" @close-drawer="showTableUpdateDrawer = !showTableUpdateDrawer">
      <component :is="currentTemplate" />
    </Drawer>
  </div>
</template>

<script>
import Drawer from '@/components/Drawer/index.vue'
import BaseList from '@/views/assets/Asset/AssetList/components/BaseList'

import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    Drawer,
    BaseList,
    HostUpdate: () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue')
  },
  data() {
    return {
      drawerTitle: '',
      showTableUpdateDrawer: false,
      currentTemplate: null,
      config: {
        url: '/api/v1/assets/assets/',
        category: 'all'
      },
      tableConfig: {
        columnsExclude: ['date_verified'],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true,
              isPam: true,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.id },
                query: { type: 'pam' }
              })
            },
            formatter: DetailFormatter
          },
          accounts_amount: {
            formatterArgs: {
              can: true,
              isPam: true,
              getTitle: ({ row }) => row.accounts_amount,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.id },
                query: { type: 'pam', tab: 'Account' }
              })
            },
            formatter: DetailFormatter
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              isPam: true,
              updateRoute: 'HostUpdate',
              onUpdate: ({ row }) => {
                this.$route.params.id = row.id

                // 解决表单详情中的跳转
                this.$route.query.type = 'pam'

                this.currentTemplate = 'HostUpdate'
                this.drawerTitle = this.$t('HostUpdate')
                this.showTableUpdateDrawer = true
              }
            }

          }
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .ibox {
  height: 100%;

  .el-card__body {
    height: 100%;
  }
}

::v-deep .page, .page.tab-page {
  .page-heading .el-row--flex {
    flex-wrap: wrap;

    .page-heading-left .el-button {
      display: none;
    }
  }
}
</style>
