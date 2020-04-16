<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/gateways/?domain=' + this.$route.params.id,
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.name'),
            sortable: 'custom'
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            sortable: 'custom'
          },
          {
            prop: 'port',
            label: this.$t('assets.port'),
            sortable: 'custom'
          },
          {
            prop: 'protocol',
            label: this.$t('assets.protocol'),
            sortable: true
          },
          {
            prop: 'username',
            label: this.$t('assets.username'),
            sortable: 'custom'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              updateRoute: 'UserUpdate',
              extraActions: [
                {
                  performDelete: ({ row, col }) => {
                    const id = row.id
                    const url = `/api/v1/assets/gateways/${id}/`
                    return this.$axios.delete(url)
                  },
                  name: 'TestConnection',
                  title: this.$t('assets.TestConnection')
                }
              ]
            }
          }
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
        createRoute: 'GatewayCreate'
      }
    }
  }
}
</script>

<style>

</style>
