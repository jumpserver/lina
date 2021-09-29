<template>
  <GenericListPage ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
</template>

<script type="text/jsx">
import { GenericListPage } from '@/layout/components'
import { REMOTE_APP_TYPE_META_MAP, ALL_TYPES } from './const'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      helpMessage: this.$t('assets.RemoteAppListHelpMessage'),
      tableConfig: {
        url: '/api/v1/applications/applications/?category=remote_app',
        columns: [
          'name', 'type', 'attrs.asset',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'type', 'attrs.asset', 'comment', 'actions']
        },
        columnsMeta: {
          type: {
            displayKey: 'get_type_display',
            width: '140px'
          },
          'attrs.asset': {
            label: this.$t('assets.Assets'),
            showOverflowTooltip: true,
            formatter: function(row, column, cellValue, index) {
              const route = { to: { name: 'AssetDetail', params: { id: cellValue }}}
              return <router-link{...{ attrs: route }} >{ row.attrs.asset_info.hostname }</router-link>
            }
          },
          actions: {
            prop: 'actions',
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'RemoteAppCreate', query: { type: row.type, clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'RemoteAppUpdate', params: { id: row.id }, query: { type: row.type }})
              },
              performDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/applications/applications/${row.id}/`
                ).then(res => {
                  this.$refs.GenericListTable.$refs.ListTable.$refs.ListTable.reloadTable()
                  // this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg') + ' ' + error)
                })
              }.bind(this)
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: true,
        hasExport: false,
        hasImport: false,
        // createRoute: 'RemoteAppCreate',
        moreCreates: {
          dropdown: this.getCreateAppType(),
          callback: (app) => {
            vm.$router.push({ name: 'RemoteAppCreate', query: { type: app.name }})
          }
        }
      }
    }
  },
  methods: {
    getCreateAppType() {
      const extraMoreActions = []
      for (const value of ALL_TYPES) {
        const item = { ...REMOTE_APP_TYPE_META_MAP[value] }
        item.can = true
        item.has = true
        extraMoreActions.push(item)
      }
      return extraMoreActions
    }
  }
}
</script>

<style lang="less" scoped>

</style>
