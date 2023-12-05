<template>
  <div>
    <ListTable class="App-Provider" v-bind="$data" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import { ActionsFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AppProvider',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/terminal/app-providers/',
        columnsShow: {
          min: ['name'],
          default: [
            'name', 'hostname', 'load', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              getRoute: ({ row }) => {
                return {
                  name: 'AppProviderDetail',
                  params: { id: row.id }
                }
              }
            }
          },
          load: {
            formatterArgs: {
              classChoices: {
                '': 'success',
                offline: 'fa fa-chain-broken text-danger',
                critical: 'fa fa-bolt text-warning',
                high: 'fa fa-exclamation-triangle text-info',
                normal: 'fa fa-check text-primary'
              }
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: false,
              hasUpload: false,
              hasUpdate: false,
              canDelete: false,
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/terminal/app-providers/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        canBulkDelete: false

      }
    }
  }
}
</script>

<style lang="scss" scoped>
.App-Provider > > > .protocol {
  margin-left: 3px;
}

</style>
