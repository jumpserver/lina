<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ActionsFormatter } from '@/components/ListTable/formatters/index'
import ListTable from '@/components/ListTable/index'

export default {
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/assets/gateways/?domain=${this.$route.params.id}`,
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
            label: this.$t('common.action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              updateRoute: 'GatewayUpdate',
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/gateways/${id}/`
                return this.$axios.delete(url)
              },
              extraActions: [
                {
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
        hasSearch: true,
        extraActions: [
          {
            name: 'actionCreate',
            title: this.$t('common.Create'),
            type: 'primary',
            has: true,
            can: true,
            callback: this.createRoute.bind(this)
          }
        ],
        hasCreate: false
      }
    }
  },
  methods: {
    createRoute(val) {
      this.$router.push({
        name: 'GatewayCreate',
        params: {
          domainid: this.object.id
        }
      })
    }
  }
}
</script>

<style>

</style>
