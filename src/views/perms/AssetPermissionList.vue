<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter, ChoicesFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'AssetPermissionDetail'
          },
          {
            prop: 'users.length',
            label: this.$t('perms.user')
          },
          {
            prop: 'user_groups.length',
            label: this.$t('perms.userGroup')
          },
          {
            prop: 'assets.length',
            label: this.$t('perms.asset')
          },
          {
            prop: 'nodes.length',
            label: this.$t('perms.node')
          },
          {
            prop: 'system_users.length',
            label: this.$t('perms.systemUser')
          },
          {
            prop: 'is_active',
            label: this.$t('perms.validity'),
            formatter: ChoicesFormatter,
            align: 'center',
            width: '80px'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
            }
          }
        ],
        tableActions: {
          hasEdit: true,
          editRoute: '404'
        }
      },
      headerActions: {
        hasDelete: false,
        hasUpdate: false,
        createRoute: 'AssetPermissionCreate'
      }
    }
  }
}
</script>

<style>

</style>
