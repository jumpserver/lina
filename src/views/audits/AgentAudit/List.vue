<template>
  <GenericListTable
    :key="`${kind}:${sessionId}:${organizationId}`"
    :header-actions="headerActions"
    :table-config="tableConfig"
    :table-metadata-provider="tableMetadata"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import GenericListTable from '@/layout/components/GenericListTable'
import {
  ActionsFormatter,
  DateFormatter,
  DetailFormatter
} from '@/components/Table/TableFormatters'
import request from '@/utils/request'
import { agentAuditRoute } from './routes'

const props = defineProps({
  kind: { type: String, required: true },
  sessionId: { type: String, default: '' },
  orgId: { type: String, default: '' },
  dateStart: { type: String, default: '' },
  dateEnd: { type: String, default: '' }
})
const store = useStore()
const router = useRouter()
const { t } = useI18n()
const organizationId = computed(() => props.orgId || store.getters.currentOrg?.id)
const orgHeaders = () => ({ 'X-JMS-ORG': organizationId.value })
const headerActions = computed(() => ({
  hasLeftActions: false,
  hasImport: false,
  hasExport: false,
  hasDatePicker: true,
  hasSearch: true,
  ...(props.sessionId
    ? { datePicker: { dateStart: props.dateStart, dateEnd: props.dateEnd } }
    : {}),
  searchConfig: { getUrlQuery: true, excludeFields: props.sessionId ? ['session_id'] : [] }
}))
const primaryColumn = computed(() => (props.kind === 'sessions' ? 'operation' : 'kind'))
const columnsMeta = computed(() => ({
  [primaryColumn.value]: {
    label: t(props.kind === 'sessions' ? 'AgentSessions' : 'Operation'),
    minWidth: '270px',
    formatter: DetailFormatter,
    formatterArgs: {
      can: true,
      getTitle: ({ row }) => row.kind || row.id,
      getRoute: ({ row }) => agentAuditRoute(props.kind, row.id, row.org_id || organizationId.value)
    }
  },
  user_display: { label: t('User'), minWidth: '130px' },
  status: { label: t('Status'), minWidth: '130px' },
  ...(props.kind === 'sessions'
    ? {
        asset_id: { label: t('Asset'), minWidth: '240px' },
        protocol: { label: t('Protocol'), width: '100px' }
      }
    : {}),
  date_created: { label: t('DateCreated'), minWidth: '180px', formatter: DateFormatter },
  ...(props.kind === 'sessions'
    ? {
        actions: {
          formatter: ActionsFormatter,
          formatterArgs: {
            hasClone: false,
            hasDelete: false,
            hasUpdate: false,
            extraActions: [
              {
                name: 'view',
                title: t('AgentSessionActions'),
                type: 'primary',
                can: true,
                callback: ({ row }) =>
                  router.push(
                    agentAuditRoute(
                      'sessions',
                      row.id,
                      row.org_id || organizationId.value,
                      'AgentActions'
                    )
                  )
              }
            ]
          }
        }
      }
    : {})
}))
const tableConfig = computed(() => ({
  url: `/api/v1/terminal/agent/audit/${props.kind}/`,
  axiosConfig: { raw: 1, headers: orgHeaders() },
  extraQuery: props.sessionId ? { session_id: props.sessionId } : {},
  columns: [
    ...new Set([...Object.keys(columnsMeta.value), 'account', 'client_id', 'asset_id', 'protocol'])
  ],
  columnsShow: {
    min: [primaryColumn.value, ...(props.kind === 'sessions' ? ['actions'] : [])],
    default: Object.keys(columnsMeta.value)
  },
  columnsMeta: { actions: { has: false }, ...columnsMeta.value }
}))
const tableMetadata = (url) => request({ url, method: 'options', headers: orgHeaders() })
</script>
