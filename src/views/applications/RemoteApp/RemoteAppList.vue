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
          'name', 'type_display', 'attrs.asset',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'type_display', 'attrs.asset', 'comment', 'actions']
        },
        columnsMeta: {
          type_display: {
            label: this.$t('applications.type')
          },
          'attrs.asset': {
            label: this.$t('assets.Assets'),
            showOverflowTooltip: true,
            formatter: function(row, column, cellValue, index) {
              const route = { to: { name: 'AssetDetail', params: { id: cellValue }}}
              const hostname = row.attrs['asset_info'].hostname
              if (vm.$hasPerm('assets.view_asset')) {
                return <router-link{...{ attrs: route }} >{ hostname }</router-link>
              } else {
                return hostname
              }
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
        searchConfig: {
          exclude: ['category', 'type'],
          options: [
            {
              value: 'type',
              label: this.$t('applications.type'),
              children: this.getCreateAppType()
            }
          ]
        },
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
        item.value = item.name
        item.label = item.title
        extraMoreActions.push(item)
      }
      return extraMoreActions
    }
  }
}
</script>

<style lang="less" scoped>

</style>
