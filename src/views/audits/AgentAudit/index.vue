<template>
  <template v-if="active && ownsRoute()">
    <GenericListPage
      v-if="!detailId"
      :key="pageKey"
      :title="t(kind === 'sessions' ? 'AgentSessions' : 'AgentActions')"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :table-metadata-provider="tableMetadata"
    />
    <TabPage
      v-else
      :key="pageKey"
      v-model:active-menu="activeMenu"
      :title="item?.id || t('AgentAuditDetail')"
      :submenu="detailTabs"
      :go-back="() => router.push(routeTo(kind))"
    >
      <template #headingRightSide>
        <el-button icon="refresh" :loading="loading" @click="load()">{{ t('Refresh') }}</el-button>
      </template>
      <el-alert v-if="error" :title="error" type="error" :closable="false" />
      <el-skeleton v-if="loading && !item" :rows="8" animated />
      <template v-else-if="item">
        <TwoCol v-if="activeMenu === 'Basic'">
          <DetailCard :items="detailItems" />
          <template v-if="kind === 'actions'" #right>
            <IBox title="AgentRequest">
              <pre>{{ json(item.request) }}</pre>
              <h4>{{ t('Result') }}</h4>
              <pre>{{ json(item.result) }}</pre>
              <p v-if="item.approval_url">
                <el-link :href="item.approval_url" target="_blank" rel="noopener noreferrer">{{
                  t('AgentApproval')
                }}</el-link>
              </p>
            </IBox>
          </template>
        </TwoCol>
        <GenericListTable
          v-else-if="kind === 'sessions' && activeMenu === 'AgentActions'"
          :header-actions="headerActions"
          :table-config="tableConfig"
          :table-metadata-provider="tableMetadata"
        />
        <IBox v-else-if="kind === 'actions' && activeMenu === 'Output'" title="Output">
          <el-empty v-if="!outputs.length" :description="t('NoData')" :image-size="60" />
          <section v-for="stream in outputs" :key="stream.name">
            <h4>{{ stream.name }}</h4>
            <pre>{{ stream.text }}</pre>
          </section>
          <el-collapse>
            <el-collapse-item :title="t('AgentEvents')">
              <article v-for="event in events" :key="event.event_id">
                <p>
                  #{{ event.sequence }} · {{ event.state }} ·
                  {{ date(event.occurred_at || event.date_received) }}
                </p>
                <pre>{{ json(event.payload) }}</pre>
              </article>
            </el-collapse-item>
          </el-collapse>
          <el-button v-if="nextOffset !== null" :loading="loading" @click="loadEvents">{{
            t('AgentMoreEvents')
          }}</el-button>
        </IBox>
      </template>
    </TabPage>
  </template>
</template>

<script setup>
import {
  computed,
  h,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  watch
} from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import GenericListPage from '@/layout/components/GenericListPage'
import GenericListTable from '@/layout/components/GenericListTable'
import TabPage from '@/layout/components/TabPage'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import DetailCard from '@/components/Cards/DetailCard'
import IBox from '@/components/Common/IBox'
import { DateFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import request from '@/utils/request'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { evidenceOutput } from './output'

const props = defineProps({ kind: { type: String, required: true } })
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const detailId = computed(() => route.params.id)
const item = ref(null)
const session = ref(null)
const events = ref([])
const nextOffset = ref(null)
const loading = ref(false)
const error = ref('')
const active = ref(false)
const activeMenu = ref('Basic')
const outputs = computed(() => evidenceOutput(events.value, nextOffset.value === null))
const pageKey = computed(
  () => `${props.kind}:${detailId.value || ''}:${route.query.oid || store.getters.currentOrg?.id}`
)
const detailTabs = computed(() => [
  { title: t('Basic'), name: 'Basic' },
  props.kind === 'sessions'
    ? { title: t('AgentActions'), name: 'AgentActions' }
    : { title: t('Output'), name: 'Output' }
])
const headerActions = {
  hasLeftActions: false,
  hasImport: false,
  hasExport: false,
  hasDatePicker: false,
  hasSearch: false
}
const columnsMeta = computed(() => ({
  operation: {
    label: t(props.kind === 'sessions' && !detailId.value ? 'AgentSessions' : 'Operation'),
    minWidth: '270px',
    formatter: DetailFormatter,
    formatterArgs: {
      can: true,
      getTitle: ({ row }) => row.kind || row.id,
      getRoute: ({ row }) => routeTo(row.kind ? 'actions' : 'sessions', row.id, row)
    }
  },
  user_display: { label: t('User'), minWidth: '130px' },
  status: { label: t('Status'), minWidth: '130px' },
  ...(props.kind === 'sessions' && !detailId.value
    ? {
        asset_id: { label: t('Asset'), minWidth: '240px' },
        protocol: { label: t('Protocol'), width: '100px' }
      }
    : {}),
  date_created: { label: t('DateCreated'), minWidth: '180px', formatter: DateFormatter }
}))
const tableConfig = computed(() => ({
  url: endpoint(),
  request: loadTable,
  hasSelection: false,
  // The audit API returns fixed pages of 100 and a next cursor, without a total.
  paginationSize: 100,
  paginationSizes: [100],
  paginationLayout: 'prev, next',
  savePageSize: false,
  columns: Object.keys(columnsMeta.value),
  columnsShow: { min: ['operation'], default: Object.keys(columnsMeta.value) },
  columnsMeta: { ...columnsMeta.value, actions: { has: false } }
}))
const tableMetadata = () =>
  Promise.resolve({
    actions: {
      GET: Object.fromEntries(
        Object.entries(columnsMeta.value).map(([name, meta]) => [
          name,
          { type: 'string', label: meta.label }
        ])
      )
    }
  })
const detailItems = computed(() => {
  if (!item.value) return []
  const data = item.value
  const parent = session.value
  const linkedItem = (key, value, to) => ({
    key: t(key),
    value,
    formatter: () => h(RouterLink, { to }, () => value)
  })
  return [
    { key: 'ID', value: data.id },
    { key: t('Status'), value: data.status },
    { key: t('Operation'), value: data.kind, has: !!data.kind },
    { key: t('User'), value: data.user_display || parent?.user_display || parent?.user_id },
    { key: t('DateCreated'), value: date(data.date_created) },
    { key: t('Asset'), value: parent?.asset_id },
    { key: t('Account'), value: parent?.account },
    { key: t('Protocol'), value: parent?.protocol },
    { key: t('MCPClientID'), value: parent?.client_id },
    ...(data.session_id
      ? [linkedItem('AgentSessions', data.session_id, routeTo('sessions', data.session_id))]
      : []),
    parent?.terminal_session_id && router.hasRoute('SessionDetail')
      ? linkedItem(
          'AgentTerminalSession',
          parent.terminal_session_id,
          terminalRoute(parent.terminal_session_id)
        )
      : { key: t('AgentTerminalSession'), value: parent?.terminal_session_id },
    { key: t('DateStart'), value: date(data.date_started), has: !!data.date_started },
    { key: t('DateEnd'), value: date(data.date_finished), has: !!data.date_finished }
  ]
})
let controller
const json = (value) => JSON.stringify(value, null, 2)
const date = (value) => (value ? toSafeLocalDateStr(value) : '—')
const endpoint = () =>
  `/api/v1/terminal/agent/audit/${props.kind}/${detailId.value ? `${detailId.value}/` : ''}`
const ownsRoute = () =>
  route.name ===
  `${props.kind === 'sessions' ? 'AgentSession' : 'AgentAction'}${detailId.value ? 'Detail' : 'List'}`
const orgHeaders = () => ({ 'X-JMS-ORG': route.query.oid || store.getters.currentOrg?.id })

function routeTo(kind, id, row = {}) {
  const resource = kind === 'sessions' ? 'AgentSession' : 'AgentAction'
  const orgId =
    row.org_id ||
    (row.audit_url && new URL(row.audit_url, location.origin).searchParams.get('oid')) ||
    session.value?.org_id ||
    route.query.oid
  return {
    name: `${resource}${id ? 'Detail' : 'List'}`,
    params: id ? { id } : {},
    query: orgId ? { oid: orgId } : {}
  }
}

function terminalRoute(id) {
  return {
    name: 'SessionDetail',
    params: { id },
    query: session.value?.org_id ? { oid: session.value.org_id } : {}
  }
}

async function loadTable(url, config) {
  const response = await request.get(url, {
    ...config,
    raw: 1,
    headers: { ...config.headers, ...orgHeaders() }
  })
  const data = response.data
  const rows = data.actions || data.results || []
  const offset = Number(new URL(url, location.origin).searchParams.get('offset') || 0)
  return {
    ...response,
    data: {
      results: rows.map((row) => ({
        ...row,
        user_display: row.user_display || data.user_display || row.user || row.user_id || ''
      })),
      count: offset + rows.length + (data.next_offset != null ? 1 : 0)
    }
  }
}

async function load() {
  if (!active.value || !ownsRoute() || !detailId.value) return
  controller?.abort()
  const current = new AbortController()
  controller = current
  loading.value = true
  error.value = ''
  item.value = session.value = null
  events.value = []
  nextOffset.value = null
  const headers = orgHeaders()
  try {
    const data = await request({
      url: endpoint(),
      headers,
      signal: current.signal
    })
    let parent = null
    if (props.kind === 'actions') {
      parent = await request({
        url: `/api/v1/terminal/agent/audit/sessions/${data.session_id}/`,
        headers,
        signal: current.signal
      })
    }
    if (current.signal.aborted) return
    item.value = data
    session.value = props.kind === 'sessions' ? data : parent
    events.value = data.events || []
    nextOffset.value = data.next_offset ?? null
  } catch (e) {
    if (!current.signal.aborted) error.value = e.response?.data?.detail || e.message || t('Error')
  } finally {
    if (controller === current) loading.value = false
  }
}

async function loadEvents() {
  const current = controller
  const after = nextOffset.value
  if (!current || current.signal.aborted || after === null || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const data = await request({
      url: endpoint(),
      params: { after },
      headers: orgHeaders(),
      signal: current.signal
    })
    if (current.signal.aborted) return
    const seen = new Set(events.value.map((event) => event.sequence))
    events.value.push(...(data.events || []).filter((event) => !seen.has(event.sequence)))
    item.value = data
    nextOffset.value = data.next_offset ?? null
  } catch (e) {
    if (!current.signal.aborted) error.value = e.message || t('Error')
  } finally {
    if (controller === current) loading.value = false
  }
}

watch(
  () => store.getters.currentOrg?.id,
  (next, previous) => {
    if (active.value && ownsRoute() && previous && next && next !== previous && route.query.oid) {
      router.replace({ query: { ...route.query, oid: next } })
    }
  }
)
watch(
  () => [props.kind, route.params.id, route.query.oid, store.getters.currentOrg?.id],
  () => {
    if (!active.value || !ownsRoute()) return
    load()
  }
)
function activate() {
  if (active.value) return
  active.value = true
  load()
}
function deactivate() {
  active.value = false
  controller?.abort()
  item.value = session.value = null
  events.value = []
}
onMounted(activate)
onActivated(activate)
onDeactivated(deactivate)
onBeforeUnmount(deactivate)
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 480px;
  overflow: auto;
}
</style>
