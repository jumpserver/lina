<template>
  <div>
    <ListTable ref="table" v-bind="$data" />
  </div>
</template>

<script type="text/jsx">
import { DrawerListTable as ListTable } from '@/components'
import CopyableFormatter from '@/components/Table/TableFormatters/CopyableFormatter.vue'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'CloudAccountList',
  components: {
    ListTable
  },
  data() {
    const vm = this
    return {
      drawerTitle: '',
      showTableUpdateDrawer: false,
      currentTemplate: null,
      tableConfig: {
        url: '/api/v1/accounts/integration-applications/',
        columnsExclude: ['accounts'],
        columnsMeta: {
          id: {
            width: '300px',
            formatter: CopyableFormatter
          },
          logo: {
            width: '80px',
            formatter: (row) => {
              return (
                <img src={row.logo} alt={row.name}
                  style='width: 40px; height: 40px; border-radius: 50%;'
                />
              )
            }
          },
          accounts_amount: {
            width: '100px',
            formatter: (row) => {
              return row.accounts_amount
            }
          },
          name: {
            formatterArgs: {
              getRoute: ({ row }) => ({
                name: 'IntegrationApplicationDetail',
                params: { id: row.id }
              }),
              drawer: true
            },
            formatter: DetailFormatter
          },
          secret: {
            label: this.$t('Secret'),
            formatter: CopyableFormatter,
            formatterArgs: {
              shadow: true,
              getText: async function({ row }) {
                const app = await vm.$axios.get(`/api/v1/accounts/integration-applications/${row.id}/secret/`)
                return app.secret
              }
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: false
            }
          }
        },
        columnsExtra: ['secret'],
        columnsShow: {
          default: [
            'logo', 'name', 'id', 'secret', 'accounts_amount', 'date_last_used', 'active'
          ]
        },
        permissions: { app: 'accounts', resource: 'integrationapplication' }
      },
      headerActions: {
        hasImport: false,
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  }
}
</script>

