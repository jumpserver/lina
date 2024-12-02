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
import AssetDetail from '@/views/assets/Asset/AssetDetail'
import BaseList from '@/views/assets/Asset/AssetList/components/BaseList'

import HostUpdate from '@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'
import { ActionsFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    Drawer,
    BaseList,
    HostUpdate,
    AssetDetail
  },
  data() {
    return {
      drawerTitle: '',
      currentTemplate: null,
      showTableUpdateDrawer: false,
      config: {
        url: '/api/v1/assets/assets/',
        category: 'all'
      },
      tableConfig: {
        columnsExclude: ['date_verified'],
        columnsMeta: {
          name: {
            formatter: (row) => {
              return (
                <span style={{ color: '#1c84c6', cursor: 'pointer' }} onClick={() => {
                  this.$route.params.id = row.id
                  this.$route.query.tab = 'Basic'

                  this.currentTemplate = 'AssetDetail'
                  this.showTableUpdateDrawer = true
                  this.drawerTitle = this.$t('AssetDetail')
                }}>
                  {row.name}
                </span>
              )
            }
          },
          accounts_amount: {
            formatter: (row) => {
              return (
                <span style={{ color: '#1c84c6', cursor: 'pointer' }} onClick={() => {
                  this.$route.params.id = row.id
                  this.$route.query.tab = 'Account'

                  this.currentTemplate = 'AssetDetail'
                  this.showTableUpdateDrawer = true
                  this.drawerTitle = this.$t('AssetDetail')
                }}>
                  {row.name}
                </span>
              )
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
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
</style>
