<template>
  <div>
    <ListTable ref="table" v-bind="$data" />

    <Drawer v-if="showTableUpdateDrawer" :title="drawerTitle" @close-drawer="showTableUpdateDrawer = !showTableUpdateDrawer">
      <component :is="currentTemplate" />
    </Drawer>
  </div>
</template>

<script type="text/jsx">
import Drawer from '@/components/Drawer/index.vue'
import ListTable from '@/components/Table/ListTable/index.vue'
import CopyableFormatter from '@/components/Table/TableFormatters/CopyableFormatter.vue'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'CloudAccountList',
  components: {
    Drawer,
    ListTable,
    IntegrationApplicationUpdate: () => import('@/views/pam/Integration/ApplicationCreateUpdate.vue'),
    IntegrationApplicationCreate: () => import('@/views/pam/Integration/ApplicationCreateUpdate.vue')

  },
  data() {
    const vm = this
    return {
      drawerTitle: '',
      showTableUpdateDrawer: false,
      currentTemplate: null,
      tableConfig: {
        url: '/api/v1/accounts/integration-applications/',
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
          accounts: {
            width: '100px',
            formatter: (row) => {
              return row.accounts_amount
            }
          },
          name: {
            formatterArgs: {
              isPam: true,
              getRoute: ({ row }) => ({
                name: 'IntegrationApplicationDetail',
                params: { id: row.id },
                query: { type: 'pam' }
              })
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
              isPam: true,
              updateRoute: 'IntegrationApplicationUpdate',
              onUpdate: ({ row }) => {
                this.$route.params.id = row.id

                // 解决表单详情中的跳转
                this.$route.query.type = 'pam'

                this.currentTemplate = 'IntegrationApplicationUpdate'
                this.drawerTitle = this.$t('IntegrationApplicationUpdate')
                this.showTableUpdateDrawer = true
              }
            }
          }
        },
        columnsExtra: ['secret'],
        columnsShow: {
          default: [
            'logo', 'id', 'secret', 'name', 'accounts', 'date_last_used', 'active'
          ]
        },
        permissions: { app: 'accounts', resource: 'integrationapplication' }
      },
      headerActions: {
        hasImport: false,
        searchConfig: {
          getUrlQuery: false
        },
        onCreate: () => {
          this.currentTemplate = 'IntegrationApplicationCreate'
          this.drawerTitle = this.$t('IntegrationApplicationCreate')
          this.showTableUpdateDrawer = true
        }
      }
    }
  }
}
</script>

