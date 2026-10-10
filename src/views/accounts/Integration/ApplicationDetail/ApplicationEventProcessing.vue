<template>
  <div class="application-events">
    <p class="context-help">{{ $t('ApplicationEventProcessingHelp') }}</p>
    <el-button :loading="loading" @click="load">{{ $t('Refresh') }}</el-button>
    <el-button
      v-if="$hasPerm('accounts.change_integrationapplication')"
      type="primary"
      :disabled="!object.is_active"
      @click="sendVisible = true"
    >
      {{ $t('SendApplicationEvent') }}
    </el-button>
    <ApplicationEventSendDialog v-model:visible="sendVisible" :application="object" @sent="load" />
    <el-tabs v-model="activeTab" class="event-table">
      <el-tab-pane :label="$t('ApplicationManualEvents')" name="manual">
        <el-alert
          v-if="loadFailed"
          :title="$t('EventHistoryLoadFailed')"
          type="error"
          :closable="false"
        />
        <p class="context-help">{{ $t('ApplicationManualEventsHelp') }}</p>
        <ApplicationCommandResults v-loading="loading" :commands="commands" />
        <el-pagination
          v-if="commandCount > 30"
          :current-page="commandPage"
          :page-size="30"
          :total="commandCount"
          layout="prev, pager, next"
          @current-change="loadCommandPage"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('ApplicationPolicyEvents')" name="policy">
        <el-alert
          v-if="loadFailed"
          :title="$t('EventHistoryLoadFailed')"
          type="error"
          :closable="false"
          class="load-error"
        />
        <el-table v-loading="loading" :data="rows" class="event-table">
          <el-table-column :label="$t('RotationEventPublishedAt')" min-width="150">
            <template #default="{ row }">{{ formatDate(row.published_at) }}</template>
          </el-table-column>
          <el-table-column :label="$t('AppAuditEvent')" min-width="250">
            <template #default="{ row }">
              <div>{{ $t(eventLabels[row.event] || 'AppAuditEvent') }}</div>
              <div v-if="row.credential || row.account || row.rotation_id" class="secondary-text">
                {{
                  [row.credential, row.account, row.rotation_id?.slice(-8)]
                    .filter(Boolean)
                    .join(' · ')
                }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('InstanceID')" min-width="160">
            <template #default="{ row }">
              <div>{{ row.instance_id }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Status')" min-width="115">
            <template #default="{ row }">{{ $t(statusLabels[receiptStatus(row)]) }}</template>
          </el-table-column>
          <el-table-column :label="$t('RotationEventReceivedAt')" min-width="150">
            <template #default="{ row }">{{ formatDate(row.received_at) }}</template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="count > 30"
          :current-page="page"
          :page-size="30"
          :total="count"
          layout="prev, pager, next"
          @current-change="loadPage"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import {
  eventLabels,
  receiptStatus,
  statusLabels
} from '../AccountRotationDetail/rotationEventTimeline'
import ApplicationEventSendDialog from '../components/ApplicationEventSendDialog.vue'
import ApplicationCommandResults from '../components/ApplicationCommandResults.vue'

export default {
  name: 'ApplicationEventProcessing',
  components: { ApplicationEventSendDialog, ApplicationCommandResults },
  props: {
    object: { type: Object, required: true }
  },
  data() {
    return {
      sendVisible: false,
      activeTab: 'manual',
      commands: [],
      commandCount: 0,
      commandPage: 1,
      count: 0,
      events: [],
      loading: false,
      loadFailed: false,
      page: 1,
      eventLabels,
      statusLabels
    }
  },
  computed: {
    rows() {
      return this.events.flatMap((event) =>
        event.recipients.map((recipient) => ({ ...event, ...recipient }))
      )
    }
  },
  watch: {
    'object.id': {
      immediate: true,
      handler() {
        this.page = 1
        this.load()
      }
    }
  },
  methods: {
    loadCommandPage(page) {
      this.commandPage = page
      this.load()
    },
    receiptStatus,
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    loadPage(page) {
      this.page = page
      this.load()
    },
    async load() {
      if (!this.object.id) return
      this.loading = true
      this.loadFailed = false
      try {
        const [data, manual] = await Promise.all([
          this.$axios.get(
            `/api/v1/accounts/integration-applications/${this.object.id}/credential-events/`,
            { params: { limit: 30, offset: (this.page - 1) * 30 } }
          ),
          this.$axios.get(
            `/api/v1/accounts/integration-applications/${this.object.id}/manual-events/`,
            {
              params: { limit: 30, offset: (this.commandPage - 1) * 30 }
            }
          )
        ])
        this.count = data.count
        this.events = data.results
        this.commandCount = manual.count
        this.commands = manual.results
      } catch (_error) {
        this.loadFailed = true
        this.count = 0
        this.events = []
        this.commands = []
        this.commandCount = 0
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.application-events {
  padding: 16px 0;
}

.context-help {
  color: var(--el-text-color-secondary);
  margin: 0 0 12px;
}

.secondary-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.event-table {
  margin-top: 12px;
}

.load-error {
  margin-top: 12px;
}
</style>
