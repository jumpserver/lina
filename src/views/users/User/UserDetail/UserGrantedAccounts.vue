<template>
  <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" class- />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  name: 'UserGrantedAccounts',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: `/api/v1/perms/users/${this.object.id}/accounts/`,
        columns: [
          'asset', 'name', 'username', 'privileged', 'version', 'comment'
        ],
        columnsShow: {
          default: [
            'asset', 'name', 'username', 'privileged', 'version'
          ],
          min: ['asset_name', 'name']
        },
        columnsMeta: {
          asset: {
            label: this.$t('assets.Asset'),
            showOverflowTooltip: true,
            formatter: function(row) {
              const to = {
                name: 'AssetDetail',
                params: { id: row.asset.id }
              }
              if (vm.$hasPerm('assets.view_asset')) {
                return <router-link to={ to } >{ row.asset.name }</router-link>
              } else {
                return <span>{ row.asset.name }</span>
              }
            }
          },
          name: {
            formatter: null
          },
          privileged: {
            width: '120px',
            label: this.$t('assets.Privileged'),
            formatterArgs: {
              showFalse: false
            }
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: true,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasMoreActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
