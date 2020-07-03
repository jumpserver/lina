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
    const vm = this
    return {
      helpMessage: this.$t('assets.RemoteAppListHelpMessage'),
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
            showOverflowTooltip: true,
            formatter: function(row, column, cellValue, index) {
              const route = { to: { name: 'AssetDetail', params: { id: cellValue }}}
              return <router-link{...{ attrs: route }} >{ row.asset_info.hostname }</router-link>
            }
          },
          actions: {
            formatterArgs: {
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'RemoteAppUpdate', params: { id: row.id }, query: { type: row.type }})
              }
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
