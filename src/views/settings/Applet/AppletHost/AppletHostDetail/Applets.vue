<template>
  <TwoCol>
    <template>
      <ListTable :header-actions="headerConfig" :table-config="config" :detail-drawer="detailDrawer" />
    </template>
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script type="text/jsx">
import { DrawerListTable as ListTable, QuickActions } from '@/components'
import { openTaskPage } from '@/utils/jms/index'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'Publications',
  components: {
    TwoCol,
    ListTable,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      detailDrawer: () => import('@/views/settings/Applet/Applet/AppletDetail/index'),
      headerConfig: {
        hasLeftActions: false,
        hasImport: false
      },
      config: {
        url: `/api/v1/terminal/applet-publications/?host=${this.object.id}`,
        columns: [
          'applet.display_name', 'applet.version',
          'date_updated', 'status', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'applet.display_name', 'status', 'actions'
          ]
        },
        columnsMeta: {
          'applet.display_name': {
            label: this.$t('DisplayName'),
            width: '160px',
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              getIcon: ({ row }) => row.applet?.icon,
              getTitle: ({ row }) => row.applet.display_name,
              getRoute: ({ row }) => ({
                name: 'AppletDetail',
                params: { id: row.applet.id }
              })
            },
            id: ({ row }) => row.applet.id
          },
          'applet.version': {
            label: this.$t('Version')
          },
          status: {
            label: this.$t('Status'),
            formatter: (row) => {
              const typeMapper = {
                'pending': 'success',
                'success': 'primary',
                'failed': 'danger',
                'unknown': 'warning'
              }
              const tp = typeMapper[row.status.value] || 'warning'
              return <el-tag size='mini' type={tp}>{row.status.label}</el-tag>
            }
          },
          date_updated: {
            label: this.$t('Date')
          },
          actions: {
            width: '138px',
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('Deploy'),
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/terminal/applet-host-deployments/applets/`,
                      {
                        hosts: [row.host.id],
                        applet_id: row.applet.id
                      }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                },
                {
                  title: this.$t('Uninstall'),
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/terminal/applet-host-deployments/uninstall/`,
                      {
                        hosts: [row.host.id],
                        applet_id: row.applet.id
                      }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                }
              ]
            }
          }
        }
      },
      quickActions: [
        {
          title: this.$t('InitialDeploy'),
          attrs: {
            type: 'primary',
            label: this.$t('Deploy')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/terminal/applet-host-deployments/`,
                { host: this.object.id }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        },
        {
          title: this.$t('OnlyInitialDeploy'),
          attrs: {
            type: 'primary',
            label: this.$t('Deploy')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/terminal/applet-host-deployments/`,
                { host: this.object.id, install_applets: false }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        },
        {
          title: this.$t('PublishAllApplets'),
          attrs: {
            type: 'primary',
            label: this.$t('Publish')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/terminal/applet-host-deployments/applets/`,
                { hosts: [this.object.id] }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        }
      ]
    }
  }
}
</script>
