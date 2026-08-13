<template>
  <TwoCol>
    <ListTable :header-actions="headerConfig" :table-config="config" />
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { DrawerListTable as ListTable, QuickActions } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { openTaskPage } from '@/utils/jms/index'
export default {
  name: 'Apps',
  components: {
    ListTable,
    QuickActions,
    TwoCol
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      headerConfig: {
        hasImport: false,
        hasExport: false,
        createRoute: {
          name: 'AppProviderPublicationCreate',
          params: { providerId: this.object.id }
        },
        createTitle: this.$t('Publish'),
        extraMoreActions: [
          {
            name: 'PublishSelected',
            title: this.$t('BatchPublish'),
            type: 'primary',
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows }) =>
              Promise.all(selectedRows.map((row) => this.publish(row, false))).then((results) => {
                if (results[0]?.task) openTaskPage(results[0].task)
              })
          }
        ]
      },
      config: {
        url: `/api/v1/terminal/virtual-app-publications/?provider=${this.object.id}`,
        columns: [
          'app.name',
          'app.image_name',
          'app_version',
          'image_digest',
          'date_synced',
          'status',
          'actions'
        ],
        columnsMeta: {
          'app.name': {
            label: this.$t('Name'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.app.name,
              getRoute: ({ row }) => ({
                name: 'VirtualAppDetail',
                params: {
                  id: row.app.id
                }
              })
            },
            id: ({ row }) => row.app.id
          },
          'app.image_name': {
            label: this.$t('ImageName')
          },
          app_version: {
            label: this.$t('Version')
          },
          image_digest: {
            label: 'Digest',
            formatter: (row) => (
              <span title={row.image_digest}>{this.shortDigest(row.image_digest)}</span>
            )
          },
          status: {
            label: this.$t('PublishStatus'),
            formatter: (row) => {
              const typeMapper = {
                pending: 'warning',
                success: 'success',
                failed: 'danger',
                mismatch: 'warning'
              }
              const tp = typeMapper[row.status.value] || 'warning'
              return (
                <el-tag size="small" type={tp}>
                  {row.status.label}
                </el-tag>
              )
            }
          },
          date_synced: {
            label: this.$t('DateSynced')
          },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasDelete: true,
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('Publish'),
                  can: this.$hasPerm('terminal.change_virtualapppublication'),
                  callback: ({ row, reloadTable }) => this.publish(row).then(reloadTable)
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
            label: this.$t('Deploy'),
            disabled: !this.object.host || !this.$hasPerm('terminal.add_appproviderdeployment')
          },
          callbacks: {
            click: () => {
              this.$axios
                .post('/api/v1/terminal/app-provider-deployments/', {
                  provider: this.object.id
                })
                .then((res) => openTaskPage(res.task))
            }
          }
        },
        {
          title: this.$t('PublishAllVirtualApps'),
          attrs: {
            type: 'primary',
            label: this.$t('Publish'),
            disabled: !this.object.host || !this.$hasPerm('terminal.change_virtualapppublication')
          },
          callbacks: {
            click: () => {
              this.$axios
                .post(`/api/v1/terminal/app-providers/${this.object.id}/publish-apps/`)
                .then((res) => {
                  if (res.task) openTaskPage(res.task)
                  else this.$message.info(this.$t('NoData'))
                })
            }
          }
        }
      ]
    }
  },
  methods: {
    publish(row, openTask = true) {
      return this.$axios
        .post(`/api/v1/terminal/virtual-app-publications/${row.id}/publish/`)
        .then((res) => {
          if (openTask) openTaskPage(res.task)
          return res
        })
    },
    shortDigest(digest) {
      if (!digest) return '-'
      const value = digest.includes('@') ? digest.split('@').pop() : digest
      return value.length > 20 ? `${value.slice(0, 20)}…` : value
    }
  }
}
</script>

<style scoped></style>
