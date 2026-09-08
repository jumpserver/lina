<template>
  <div>
    <ListTable
      :key="object.id || credential.id || 'all'"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :table-metadata-provider="getMetadata"
    />
    <Drawer v-model:visible="detailVisible" :title="$t('AppAuditDetail')">
      <ApplicationAuditDetail v-if="detailVisible" :object="selected" />
    </Drawer>
  </div>
</template>

<script>
import { ListTable } from '@/components'
import Drawer from '@/components/Drawer'
import { DetailFormatter, TagChoicesFormatter } from '@/components/Table/TableFormatters'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import request from '@/utils/request'
import ApplicationAuditDetail from './ApplicationAuditDetail.vue'
import { auditEvents, auditResults, resultTagTypes, normalizeAudit } from './applicationAudit'

export default {
  name: 'ApplicationAudit',
  components: { ListTable, Drawer, ApplicationAuditDetail },
  props: {
    object: { type: Object, default: () => ({}) },
    credential: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      detailVisible: false,
      selected: null,
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
        name: 'ApplicationAudit',
        url: '/api/v1/accounts/application-audits/',
        permissions: { view: 'audits.view_integrationapplicationlog' },
        request: async (url, config) => {
          const response = await request.get(url, config)
          response.data.results = response.data.results.map((row) => normalizeAudit(row, this.$t))
          return response
        },
        hasSelection: false,
        columnsShow: {
          min: ['event_display', 'result', 'datetime'],
          default: ['event_display', 'service', 'credential', 'operator', 'result', 'datetime']
        },
        columnsMeta: { actions: { has: false } },
        columns: [
          {
            prop: 'event_display',
            label: this.$t('AppAuditEvent'),
            minWidth: 170,
            formatter: DetailFormatter,
            formatterArgs: {
              onClick: async ({ row }) => {
                const detail = await request.get(`/api/v1/accounts/application-audits/${row.id}/`)
                this.selected = normalizeAudit(detail, this.$t)
                this.detailVisible = true
              }
            }
          },
          { prop: 'service', label: this.$t('RelevantApp'), minWidth: 170 },
          { prop: 'credential', label: this.$t('ApplicationCredential'), minWidth: 170 },
          { prop: 'configuration', label: this.$t('ClientAccessConfiguration'), minWidth: 180 },
          { prop: 'instance_id', label: this.$t('InstanceID'), minWidth: 170 },
          { prop: 'operator', label: this.$t('AppAuditActor'), minWidth: 130 },
          {
            prop: 'result',
            label: this.$t('Result'),
            width: 100,
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagLabel: ({ row }) => row.result_display,
              getTagType: ({ row }) => resultTagTypes[row.result]
            }
          },
          {
            prop: 'datetime',
            label: this.$t('Date'),
            width: 180,
            formatter: (row) => toSafeLocalDateStr(row.datetime)
          },
          { prop: 'remote_addr', label: this.$t('IP'), width: 140 },
          { prop: 'summary', label: this.$t('Detail'), minWidth: 260 }
        ]
      }
    }
  },
  methods: {
    async getMetadata() {
      const choice = (label, values) => ({
        label,
        type: 'choice',
        multiple: false,
        choices: Object.entries(values).map(([value, key]) => ({ value, label: this.$t(key) }))
      })
      return {
        actions: { GET: {} },
        filters: {
          event: choice(this.$t('AppAuditEvent'), auditEvents),
          result: choice(this.$t('Result'), auditResults),
          source: choice(this.$t('AppAuditSource'), {
            SDK: 'SDKAccess',
            Agent: 'AgentAccess',
            Administrator: 'AppAuditAdministrator',
            JumpServer: 'ChatAIResultSource'
          })
        },
        search: {
          fields: ['service', 'credential', 'operator', 'summary'],
          operators: ['icontains']
        },
        ordering: {
          fields: [{ name: 'date_created', label: this.$t('Date') }],
          default: ['-date_created']
        }
      }
    }
  }
}
</script>
