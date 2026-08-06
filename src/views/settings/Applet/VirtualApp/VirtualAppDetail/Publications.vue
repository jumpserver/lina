<template>
  <ListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script lang="jsx">
import { DrawerListTable as ListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'Publications',
  components: { ListTable },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasBulkDelete: false,
        createRoute: {
          name: 'VirtualAppPublicationCreate',
          params: { id: this.object.id }
        },
        createTitle: this.$t('Publish'),
        extraMoreActions: [
          {
            name: 'PublishSelected',
            title: this.$t('BatchPublish'),
            type: 'primary',
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows }) =>
              Promise.all(selectedRows.map((row) => vm.publish(row, false))).then((results) => {
                if (results[0]?.task) openTaskPage(results[0].task)
              })
          }
        ]
      },
      tableConfig: {
        url: `/api/v1/terminal/virtual-app-publications/?app=${this.object.id}`,
        columns: [
          'provider.name',
          'provider.hostname',
          'app_version',
          'image_digest',
          'date_synced',
          'status',
          'actions'
        ],
        columnsMeta: {
          'provider.name': {
            label: this.$t('AppProvider'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.provider.name,
              getRoute: ({ row }) => ({
                name: 'AppProviderDetail',
                params: { id: row.provider.id }
              })
            }
          },
          'provider.hostname': { label: this.$t('Hostname') },
          app_version: { label: this.$t('Version') },
          image_digest: {
            label: 'Digest',
            formatter: (row) => (
              <span title={row.image_digest}>{vm.shortDigest(row.image_digest)}</span>
            )
          },
          date_synced: { label: this.$t('DateSynced') },
          status: {
            label: this.$t('PublishStatus'),
            formatter: (row) => vm.statusTag(row.status)
          },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              hasDelete: true,
              extraActions: [
                {
                  title: this.$t('Publish'),
                  can: this.$hasPerm('terminal.change_virtualapppublication'),
                  callback: ({ row, reloadTable }) => vm.publish(row).then(reloadTable)
                }
              ]
            }
          }
        }
      }
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
    },
    statusTag(status = {}) {
      const type =
        {
          pending: 'warning',
          success: 'success',
          failed: 'danger',
          mismatch: 'warning'
        }[status.value] || 'info'
      return (
        <el-tag size="small" type={type}>
          {status.label || status.value}
        </el-tag>
      )
    }
  }
}
</script>
