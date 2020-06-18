<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable/index'
import DisplayFormatter from '@/components/ListTable/formatters/DisplayFormatter'
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
        columns: ['name', 'ip', 'port', 'protocol', 'username', 'comment', 'actions'],
        columnsMeta: {
          name: {
            sortable: 'custom',
            formatter: DisplayFormatter
          },
          protocol: {
            sortable: 'custom'
          },
          actions: {
            formatterArgs: {
              updateRoute: 'GatewayUpdate',
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/gateways/${id}/`
                return this.$axios.delete(url)
              },
              extraActions: [
                {
                  name: 'TestConnection',
                  title: this.$t('assets.TestConnection'),
                  callback: function(val) {
                    if (!val.row.port) {
                      return this.$message.error(this.$t('common.BadRequestErrorMsg'))
                    }
                    this.$axios.post(`/api/v1/assets/gateways/${val.cellValue}/test-connective/`, { port: val.row.port }).then(
                      res => {
                        return this.$message.success(this.$t('common.TestSuccessMsg'))
                      }
                    )
                  }
                }
              ]
            }
          }

        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasSearch: true,
        createRoute: {
          name: 'GatewayCreate',
          query: {
            domain: this.object.id
          }
        }
      }
    }
  }
}
</script>

<style>

</style>
