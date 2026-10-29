<template>
  <Page :title="t(kind === 'sessions' ? 'AgentSessions' : 'AgentActions')">
    <div class="agent-audit">
      <div class="audit-toolbar">
        <router-link :to="routeTo('sessions')">{{ t('AgentSessions') }}</router-link>
        <router-link :to="routeTo('actions')">{{ t('AgentActions') }}</router-link>
        <el-button :loading="loading" @click="load(offset)">{{ t('Refresh') }}</el-button>
      </div>
      <el-alert v-if="error" :title="error" type="error" :closable="false" />
      <IBox v-if="item" :title="'AgentAuditDetail'">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ item.id }}</el-descriptions-item>
          <el-descriptions-item :label="t('Status')">{{ item.status }}</el-descriptions-item>
          <el-descriptions-item v-if="item.kind" :label="t('Operation')">{{
            item.kind
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('User')">{{
            item.user_display || session?.user_display || session?.user_id || '—'
          }}</el-descriptions-item>
          <el-descriptions-item :label="t('DateCreated')">{{
            date(item.date_created)
          }}</el-descriptions-item>
          <el-descriptions-item v-if="session" :label="t('Asset')">{{
            session.asset_id
          }}</el-descriptions-item>
          <el-descriptions-item v-if="session" :label="t('Account')">{{
            session.account
          }}</el-descriptions-item>
          <el-descriptions-item v-if="session" :label="t('Protocol')">{{
            session.protocol
          }}</el-descriptions-item>
          <el-descriptions-item v-if="session" :label="t('MCPClientID')">{{
            session.client_id
          }}</el-descriptions-item>
          <el-descriptions-item v-if="item.session_id" :label="t('AgentSessions')">
            <router-link :to="routeTo('sessions', item.session_id)">{{
              item.session_id
            }}</router-link>
          </el-descriptions-item>
          <el-descriptions-item :label="t('AgentTerminalSession')">
            <router-link
              v-if="session?.terminal_session_id && router.hasRoute('SessionDetail')"
              :to="terminalRoute(session.terminal_session_id)"
            >
              {{ session.terminal_session_id }}
            </router-link>
            <span v-else>{{ session?.terminal_session_id || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="item.date_started" :label="t('DateStart')">{{
            date(item.date_started)
          }}</el-descriptions-item>
          <el-descriptions-item v-if="item.date_finished" :label="t('DateEnd')">{{
            date(item.date_finished)
          }}</el-descriptions-item>
        </el-descriptions>
        <template v-if="kind === 'actions'">
          <h4>{{ t('AgentRequest') }}</h4>
          <pre>{{ json(item.request) }}</pre>
          <h4>{{ t('Result') }}</h4>
          <pre>{{ json(item.result) }}</pre>
          <p v-if="item.approval_url">
            <el-link :href="item.approval_url" target="_blank" rel="noopener noreferrer">{{
              t('AgentApproval')
            }}</el-link>
          </p>
        </template>
      </IBox>
      <IBox v-if="detailId && kind === 'actions' && item" :title="'Output'">
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
      <IBox v-else v-loading="loading">
        <el-table :data="rows" row-key="id" :empty-text="t('NoData')">
          <el-table-column :label="t('Operation')" min-width="270">
            <template #default="{ row }">
              <router-link :to="routeTo(row.kind ? 'actions' : 'sessions', row.id, row)">{{
                row.kind || row.id
              }}</router-link>
            </template>
          </el-table-column>
          <el-table-column prop="user_display" :label="t('User')" min-width="130" />
          <el-table-column prop="status" :label="t('Status')" min-width="130" />
          <el-table-column
            v-if="kind === 'sessions' && !detailId"
            prop="asset_id"
            :label="t('Asset')"
            min-width="240"
          />
          <el-table-column
            v-if="kind === 'sessions' && !detailId"
            prop="protocol"
            :label="t('Protocol')"
            width="100"
          />
          <el-table-column :label="t('DateCreated')" min-width="180">
            <template #default="{ row }">{{ date(row.date_created) }}</template>
          </el-table-column>
        </el-table>
        <div class="audit-pagination">
          <el-button :disabled="loading || offset === 0" @click="load(Math.max(0, offset - 100))">{{
            t('AgentPreviousPage')
          }}</el-button>
          <el-button :disabled="loading || nextOffset === null" @click="load(nextOffset)">{{
            t('AgentNextPage')
          }}</el-button>
        </div>
      </IBox>
    </div>
  </Page>
</template>

<script setup>
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Page from '@/layout/components/Page'
import IBox from '@/components/Common/IBox'
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
const rows = ref([])
const events = ref([])
const offset = ref(0)
const nextOffset = ref(null)
const loading = ref(false)
const error = ref('')
const active = ref(false)
const outputs = computed(() => evidenceOutput(events.value, nextOffset.value === null))
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

async function load(pageOffset = 0) {
  if (!active.value || !ownsRoute()) return
  controller?.abort()
  const current = new AbortController()
  controller = current
  loading.value = true
  error.value = ''
  item.value = session.value = null
  rows.value = events.value = []
  nextOffset.value = null
  const headers = orgHeaders()
  try {
    const data = await request({
      url: endpoint(),
      params: { offset: pageOffset },
      headers,
      signal: current.signal
    })
    let parent = null
    if (detailId.value && props.kind === 'actions') {
      parent = await request({
        url: `/api/v1/terminal/agent/audit/sessions/${data.session_id}/`,
        headers,
        signal: current.signal
      })
    }
    if (current.signal.aborted) return
    offset.value = pageOffset
    nextOffset.value = data.next_offset ?? null
    if (detailId.value) {
      item.value = data
      session.value = props.kind === 'sessions' ? data : parent
      rows.value = (data.actions || []).map((row) => ({
        ...row,
        user_display: row.user_display || data.user_display || data.user || data.user_id || ''
      }))
      events.value = data.events || []
    } else {
      rows.value = (data.results || []).map((row) => ({
        ...row,
        user_display: row.user_display || row.user || row.user_id || ''
      }))
    }
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
    offset.value = 0
    load()
  },
  { immediate: true }
)
function activate() {
  if (active.value) return
  active.value = true
  load(offset.value)
}
function deactivate() {
  active.value = false
  controller?.abort()
  item.value = session.value = null
  rows.value = events.value = []
}
onMounted(activate)
onActivated(activate)
onDeactivated(deactivate)
onBeforeUnmount(deactivate)
</script>

<style scoped>
.agent-audit {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.audit-toolbar,
.audit-pagination {
  display: flex;
  align-items: center;
  gap: 16px;
}
.audit-pagination {
  justify-content: flex-end;
  margin-top: 16px;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 480px;
  overflow: auto;
}
</style>
