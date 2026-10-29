<template>
  <ListTable
    :key="object.id || 'all'"
    :table-config="tableConfig"
    :header-actions="headerActions"
  />
</template>

<script>
import { ListTable } from '@/components'
import { TagChoicesFormatter } from '@/components/Table/TableFormatters'
import { toSafeLocalDateStr } from '@/composables/useDateTime'

const sources = { SDK: 'SDKAccess', Agent: 'AgentAccess' }
const results = { success: 'Success', failed: 'Failed' }

export default {
  name: 'ApplicationCallLog',
  components: { ListTable },
  props: { object: { type: Object, default: () => ({}) } },
  data() {
    return {
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false,
        hasDatePicker: true,
        searchConfig: { getUrlQuery: false }
      }
    }
  },
  computed: {
    tableConfig() {
      return {
        name: 'ApplicationCallLog',
        url: '/api/v1/audits/service-access-logs/',
        extraQuery: this.object.id ? { service_id: this.object.id } : {},
        permissions: { view: 'audits.view_integrationapplicationlog' },
        hasSelection: false,
        hasOperation: false,
        columnsShow: {
          min: ['service', 'asset', 'account', 'datetime'],
          default: [
            'service',
            'asset',
            'account',
            'instance_id',
            'source',
            'result',
            'remote_addr',
            'datetime'
          ]
        },
        columns: [
          { prop: 'id', label: this.$t('ID'), minWidth: 260 },
          { prop: 'service', label: this.$t('RelevantApp'), minWidth: 170 },
          { prop: 'service_id', label: this.$t('ApplicationID'), minWidth: 260 },
          { prop: 'asset', label: this.$t('Asset'), minWidth: 180 },
          { prop: 'account', label: this.$t('Account'), minWidth: 160 },
          { prop: 'instance_id', label: this.$t('InstanceID'), minWidth: 170 },
          {
            prop: 'source',
            label: this.$t('AppAuditSource'),
            width: 120,
            formatter: (row) =>
              sources[row.source] ? this.$t(sources[row.source]) : row.source || '-'
          },
          {
            prop: 'result',
            label: this.$t('Result'),
            width: 100,
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagLabel: ({ row }) => this.$t(results[row.result] || row.result),
              getTagType: ({ row }) => (row.result === 'success' ? 'success' : 'danger')
            }
          },
          { prop: 'remote_addr', label: this.$t('IP'), width: 140 },
          {
            prop: 'datetime',
            label: this.$t('Date'),
            width: 180,
            formatter: (row) => toSafeLocalDateStr(row.datetime)
          },
          { prop: 'credential_key', label: this.$t('CredentialKey'), minWidth: 200 },
          { prop: 'revision', label: this.$t('AppAuditRevision'), width: 100 },
          { prop: 'summary', label: this.$t('Detail'), minWidth: 220 }
        ]
      }
    }
  }
}
</script>
