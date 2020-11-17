<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
</template>

<script type="text/jsx">
import { GenericListPage } from '@/layout/components'
import { REMOTE_APP_TYPE_META_MAP, ALL_TYPES } from './const'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      helpMessage: this.$t('assets.RemoteAppListHelpMessage'),
      tableConfig: {
        url: '/api/v1/applications/applications/?category=remote_app',
        columns: [
          'name', 'type', 'attrs.asset', 'comment', 'actions'
        ],
        columnsMeta: {
          type: {
            displayKey: 'get_type_display',
            width: '140px'
          },
          'attrs.asset': {
            label: this.$t('assets.Assets'),
            showOverflowTooltip: true,
            formatter: function(row, column, cellValue, index) {
              console.log(row, column, cellValue)
              const route = { to: { name: 'AssetDetail', params: { id: cellValue }}}
              return <router-link{...{ attrs: route }} >{ row.attrs.asset_info.hostname }</router-link>
            }
          },
          actions: {
            formatterArgs: {
              // onUpdate: ({ row }) => {
              //   vm.$router.push({ name: 'RemoteAppUpdate', params: { id: row.id }, query: { type: row.type }})
              // },
              onDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/applications/applications/${row.id}/`
                ).then(res => {
                  this.$refs.GenericListTable.$refs.ListTable.reloadTable()
                  this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + error))
                })
              }.bind(this)
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasMoreActions: false,
        hasBulkDelete: false,
        // createRoute: 'RemoteAppCreate',
        moreActionsTitle: this.$t('common.Create'),
        moreActionsType: 'primary',
        extraMoreActions: this.genExtraMoreActions()
      }
    }
  },
  methods: {
    onCallback(type) {
      this.$router.push({ name: 'RemoteAppCreate', query: { type: type }})
    },
    genExtraMoreActions() {
      const extraMoreActions = []
      for (const value of ALL_TYPES) {
        const item = { ...REMOTE_APP_TYPE_META_MAP[value] }
        item.type = 'primary'
        item.can = true
        item.callback = this.onCallback.bind(this, value)
        extraMoreActions.push(item)
      }
      return extraMoreActions
    }
  }
}
</script>

<style lang="less" scoped>

</style>
