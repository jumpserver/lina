<template>
  <div>
    <el-alert type="info">
      <span ref="helpRef" class="app-provider-help" />
    </el-alert>
    <ListTable
      v-bind="$data"
      ref="table"
      class="app-provider"
      :create-drawer="createDrawer"
      :resource="$t('AppProvider')"
    />
  </div>
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'
import { ActionsFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AppProvider',
  components: {
    ListTable
  },
  data() {
    return {
      createDrawer: () => import('./AppProviderCreateUpdate.vue'),
      detailDrawer: () => import('./AppProviderDetail/index.vue'),
      tableConfig: {
        url: '/api/v1/terminal/app-providers/',
        columnsShow: {
          min: ['name'],
          default: ['name', 'hostname', 'load', 'actions']
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
              hasUpdate: true,
              canUpdate: this.$hasPerm('terminal.change_appprovider'),
              updateRoute: 'AppProviderUpdate',
              hasDelete: true,
              canDelete: this.$hasPerm('terminal.delete_appprovider'),
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
        hasCreate: true,
        createRoute: 'AppProviderCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        canBulkDelete: false
      }
    }
  },
  mounted() {
    this.renderHelp()
  },
  activated() {
    this.renderHelp()
  },
  methods: {
    renderHelp() {
      this.$nextTick(() => {
        const el = this.$refs.helpRef
        if (el) {
          el.innerHTML = this.$xss.process(String(this.$t('AppProviderHelpMessage') || ''))
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-provider :deep(.protocol) {
  margin-left: 3px;
}
</style>
