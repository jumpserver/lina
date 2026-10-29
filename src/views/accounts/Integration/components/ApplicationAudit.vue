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
        extraQuery: {
          exclude_event: 'credential_fetched',
          ...(this.object.id ? { application: this.object.id } : {}),
          ...(this.credential.id ? { credential_id: this.credential.id } : {})
        },
        permissions: { view: 'audits.view_integrationapplicationlog' },
        request: async (url, config) => {
          const response = await request.get(url, config)
          response.data.results = response.data.results.map((row) => normalizeAudit(row, this.$t))
          return response
        },
        hasSelection: true,
        columnsShow: {
          min: ['event_display', 'result', 'datetime'],
          default: ['event_display', 'service', 'credential', 'operator', 'result', 'datetime']
        },
        columnsMeta: { actions: { has: false } },
        columns: [
          { prop: 'id', label: this.$t('AppAuditRecordID'), minWidth: 260 },
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
          { prop: 'service_id', label: this.$t('ApplicationID'), minWidth: 260 },
          { prop: 'credential', label: this.$t('ApplicationCredential'), minWidth: 170 },
          { prop: 'account', label: this.$t('Account'), minWidth: 170 },
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
    async getMetadata(url) {
      const metadata = await this.$store.dispatch('common/getUrlMeta', { url })
      const choice = (label, values) => ({
        label,
        type: 'choice',
        multiple: false,
        operators: ['exact', 'in'],
        choices: Object.entries(values).map(([value, key]) => ({ value, label: this.$t(key) }))
      })
      return {
        ...metadata,
        filters: {
          ...metadata.filters,
          event: choice(
            this.$t('AppAuditEvent'),
            Object.fromEntries(
              Object.entries(auditEvents).filter(([event]) => event !== 'credential_fetched')
            )
          ),
          result: choice(this.$t('Result'), auditResults),
          source: choice(this.$t('AppAuditSource'), {
            SDK: 'SDKAccess',
            Agent: 'AgentAccess',
            Administrator: 'AppAuditAdministrator',
            JumpServer: 'ChatAIResultSource'
          })
        }
      }
    }
  }
}
</script>
