<template>
  <div>
    <el-alert type="info">
      <span ref="helpRef" class="applet-host-help" />
    </el-alert>
    <DrawerListTable
      v-bind="$data"
      ref="table"
      class="applet-host"
      :create-drawer="createDrawer"
      :resource="$t('AppletHosts')"
    />
  </div>
</template>

<script>
import { DrawerListTable } from '@/components'
import { ProtocolsFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'AppletHost',
  components: {
    DrawerListTable
  },
  data() {
    const appletRouteQuery = { type: 'windows', category: 'host', platform: 'RemoteAppHost' }
    return {
      createDrawer: () => import('./AppletHostCreateUpdate.vue'),
      detailDrawer: () => import('./AppletHostDetail/index.vue'),
      tableConfig: {
        url: '/api/v1/terminal/applet-hosts/',
        columnsExclude: ['info', 'auto_config', 'gathered_info', 'deploy_options'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'address', 'protocols', 'load', 'comment', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              getRoute: ({ row }) => {
                return {
                  name: 'AppletHostDetail',
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
          protocols: {
            formatter: ProtocolsFormatter
          },
          actions: {
            formatterArgs: {
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/terminal/applet-hosts/${id}/`
                return this.$axios.delete(url)
              },
              onUpdate: ({ row }) => {
                this.$refs.table.onUpdate({ row: row, query: appletRouteQuery })
              },
              extraActions: [
                {
                  name: 'Test',
                  title: this.$t('Test'),
                  can: this.$hasPerm('assets.test_assetconnectivity'),
                  callback: ({ row }) => {
                    this.$axios
                      .post(`/api/v1/assets/assets/${row.id}/tasks/`, { action: 'refresh' })
                      .then((res) => {
                        openTaskPage(res['task'])
                      })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        createRoute: 'AppletHostCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        onCreate: () => {
          this.$refs.table.onCreate({ query: appletRouteQuery })
        }
      }
    }
  },
  mounted() {
    this.renderHelp()
  },
  activated() {
    // keep-alive 切回该 tab 时也重渲，确保帮助文案一定出现
    this.renderHelp()
  },
  methods: {
    // 命令式渲染帮助文案：绕开 v-html 编译转换在 keep-alive/时序下对内联 $t 不重算的问题。
    renderHelp() {
      this.$nextTick(() => {
        const el = this.$refs.helpRef
        if (el) {
          el.innerHTML = this.$xss.process(String(this.$t('AppletHostSelectHelpMessage') || ''))
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.applet-host :deep(.protocol) {
  margin-left: 3px;
}
</style>
