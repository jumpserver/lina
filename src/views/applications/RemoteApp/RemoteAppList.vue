<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/applications/remote-apps/',
        columns: [
          'name', 'type', 'asset', 'comment', 'actions'
        ],
        columnsMeta: {
          type: {
            displayKey: 'get_type_display'
          },
          asset: {
            formatter: function(row, column, cellValue, index) {
              return <a class='detail el-link el-link--success is-underline' href={ `/assets/assets/${cellValue}` }>{ row.asset_info.hostname }</a>
            }
          }
        },
        detailRoute: 'RemoteAppDetail',
        actions: {
          updateRoute: 'RemoteAppUpdate'
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        // createRoute: 'RemoteAppCreate',
        moreActionsTitle: '创建',
        extraMoreActions: [
          {
            name: 'Chrome',
            title: 'Chrome',
            type: 'primary',
            can: true,
            callback: this.createChrome.bind(this)
          },
          {
            name: 'MySQL Workbench',
            title: 'MySQL Workbench',
            type: 'primary',
            can: true,
            callback: this.createMysqlWorkbench.bind(this)
          },
          {
            name: 'vSphere Client',
            title: 'vSphere Client',
            type: 'primary',
            can: true,
            callback: this.createVSphereClient.bind(this)
          },
          {
            name: '自定义',
            title: '自定义',
            type: 'primary',
            can: true,
            callback: this.createCustom.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    createChrome() {
      this.$router.push({ name: 'RemoteAppCreate', query: { type: 'chrome' }})
    },
    createMysqlWorkbench() {
      this.$router.push({ name: 'RemoteAppCreate', query: { type: 'mysql_workbench' }})
    },
    createVSphereClient() {
      this.$router.push({ name: 'RemoteAppCreate', query: { type: 'vmware_client' }})
    },
    createCustom() {
      this.$router.push({ name: 'RemoteAppCreate', query: { type: 'custom' }})
    }
  }
}
</script>

<style lang="less" scoped>

</style>
