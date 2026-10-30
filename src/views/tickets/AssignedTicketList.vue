<template>
  <div>
    <BaseTicketList
      v-bind="$data"
      ref="BaseTicketList"
      :url="url"
      :pending-only="tab === 'pending'"
      :extra-ticket-action="tab === 'pending' ? extraTicketAction : { hasCreate: false }"
    >
      <template #tableBefore>
        <div class="ticket-list-filters">
          <el-tabs v-model="tab" class="ticket-list-tabs">
            <el-tab-pane name="pending" :label="$t('AwaitingMyApproval')" />
            <el-tab-pane name="processed" :label="$t('WFProcessedByMe')" />
            <el-tab-pane name="cc" :label="$t('TicketCopiedToMe')" />
          </el-tabs>
        </div>
      </template>
    </BaseTicketList>
    <Dialog
      v-if="isVisible"
      v-model:visible="isVisible"
      :destroy-on-close="true"
      :title="
        $t(bulkResults.length ? 'TicketBatchResultTitle' : 'TicketBatchApprovalTitle', {
          count: ticketData.length
        })
      "
      :show-close="!bulkLoading"
      :close-on-click-modal="!bulkLoading"
      :close-on-press-escape="!bulkLoading"
      width="70%"
    >
      <template v-if="bulkResults.length">
        <p class="batch-summary" role="status">{{ bulkSummary }}</p>
        <el-table :data="bulkResults" :max-height="480" row-key="ticket.id">
          <el-table-column :label="$t('Ticket')" min-width="200">
            <template #default="{ row }">
              {{ row.ticket.title }}
              <div class="batch-ticket-number">{{ row.ticket.serial_num }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Result')" width="140">
            <template #default="{ row }">
              <el-tag :type="row.success ? 'success' : 'warning'">
                {{
                  $t(
                    row.success
                      ? bulkAction === 'approve'
                        ? 'Approved'
                        : 'Rejected'
                      : row.unknown
                        ? 'TicketBatchUnknown'
                        : row.partial
                          ? 'TicketBatchPartial'
                          : 'TicketBatchUnfinished'
                  )
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('Reason')" min-width="280">
            <template #default="{ row }">{{ row.reason || '—' }}</template>
          </el-table-column>
          <el-table-column :label="$t('Actions')" width="100">
            <template #default="{ row }">
              <el-link
                :href="ticketDetailUrl(row.ticket)"
                target="_blank"
                rel="noopener"
                type="primary"
              >
                {{ $t('TicketBatchViewDetail') }}
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-else>
        <div v-for="d in ticketData" :key="d.id" class="approval-ticket">
          <AutoDetailCard
            :fields="getDetailFields(d)"
            :object="d"
            :title="`${d.title}(${ticketTypeLabel(d.type)})`"
            :url="detailUrl"
          />
          <LoginAssetConnections
            v-if="d.login_asset_connections?.length"
            :connections="d.login_asset_connections"
          />
        </div>
      </template>
      <template #footer>
        <el-button v-if="bulkResults.length" type="primary" @click="isVisible = false">
          {{ $t('Finished') }}
        </el-button>
        <template v-else>
          <span v-if="bulkLoading" class="batch-progress" role="status">
            {{ $t('TicketBatchProgress', { done: bulkCompleted, total: ticketData.length }) }}
          </span>
          <el-button
            type="danger"
            plain
            :disabled="bulkLoading"
            :loading="bulkLoading && bulkAction === 'reject'"
            @click="bulk('reject')"
          >
            {{ $t(bulkLoading && bulkAction === 'reject' ? 'Processing' : 'BatchReject') }}
          </el-button>
          <el-button
            type="primary"
            :disabled="bulkLoading"
            :loading="bulkLoading && bulkAction === 'approve'"
            @click="bulk('approve')"
          >
            {{ $t(bulkLoading && bulkAction === 'approve' ? 'Processing' : 'BatchConsent') }}
          </el-button>
        </template>
      </template>
    </Dialog>
  </div>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import Dialog from '@/components/Dialog'
import { mapGetters } from 'vuex'
import { h } from 'vue'
import TicketValueList from './components/TicketValueList'
import BaseTicketList from './BaseTicketList'
import LoginAssetConnections from './components/LoginAssetConnections.vue'
import { getTicketTypeLabel } from './const'
import { getTicketDetailRoute } from './plugins/registry'
import { getErrorResponseMsg } from '@/utils/common'
import { toSafeLocalDateStr } from '@/composables/useDateTime'

export default {
  name: 'AssignedTicketList',
  components: {
    Dialog,
    AutoDetailCard,
    BaseTicketList,
    LoginAssetConnections
  },
  data() {
    return {
      tab: 'pending',
      ticketData: [],
      detailUrl: `/api/v1/tickets/tickets/`,
      isVisible: false,
      bulkLoading: false,
      bulkAction: '',
      bulkCompleted: 0,
      bulkResults: [],
      extraTicketAction: {
        hasCreate: false,
        hasMoreActions: true,
        extraMoreActions: [
          {
            name: 'ApproveSelected',
            title: this.$t('ApprovalSelected'),
            icon: 'fa-solid fa-check',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && !this.bulkLoading
            },
            callback: function ({ selectedRows }) {
              if (this.bulkLoading) return
              this.bulkResults = []
              this.bulkCompleted = 0
              this.bulkAction = ''
              this.ticketData = [...selectedRows]
              this.isVisible = true
            }.bind(this)
          }
        ]
      }
    }
  },
  computed: {
    bulkSummary() {
      const count = this.bulkResults.filter((row) => row.success).length
      const remaining = this.bulkResults.length - count
      return this.$t(
        remaining
          ? this.bulkAction === 'approve'
            ? 'TicketBatchApproveSummary'
            : 'TicketBatchRejectSummary'
          : this.bulkAction === 'approve'
            ? 'TicketBatchApproved'
            : 'TicketBatchRejected',
        { count, remaining }
      )
    },
    url() {
      if (this.tab === 'cc') {
        return `/api/v1/tickets/tickets/?cc_users__id=${this.currentUser.id}`
      }
      return this.tab === 'pending'
        ? `/api/v1/tickets/tickets/?assignees__id=${this.currentUser.id}&state=pending`
        : `/api/v1/tickets/tickets/?processed_by=${this.currentUser.id}`
    },
    ...mapGetters(['currentUser'])
  },
  methods: {
    ticketTypeLabel(type) {
      return getTicketTypeLabel(type, this.$t)
    },
    ticketDetailUrl(ticket) {
      return this.$router.resolve({
        name: getTicketDetailRoute(ticket.type.value || ticket.type),
        params: { id: ticket.id },
        query: { oid: ticket.org_id }
      }).href
    },
    bulkError(error) {
      const status = error.response?.status
      if (!status || status >= 500) return this.$t('TicketBatchUnknownReason')
      if (status === 409) return this.$t('TicketBatchStateChanged')
      if (status === 403) return this.$t('TicketBatchForbidden')
      if (status === 404) return this.$t('TicketBatchUnavailable')
      return getErrorResponseMsg(error) || this.$t('TicketBatchStateChanged')
    },
    async bulk(action) {
      if (this.bulkLoading || this.bulkResults.length || !this.ticketData.length) return
      this.bulkLoading = true
      this.bulkAction = action
      this.bulkCompleted = 0
      try {
        const rows = await Promise.all(
          this.ticketData.map(async (ticket) => {
            const results = await Promise.allSettled(
              (ticket.my_tasks || []).map((task) =>
                this.$axios.post(
                  `/api/v1/tickets/approval-tasks/${task}/${action}/`,
                  {},
                  { params: { oid: ticket.org_id }, disableFlashErrorMsg: true }
                )
              )
            )
            const failures = results.filter((result) => result.status === 'rejected')
            this.bulkCompleted++
            return {
              ticket,
              success: results.length > 0 && failures.length === 0,
              partial: failures.length > 0 && failures.length < results.length,
              unknown: failures.some(
                ({ reason }) => !reason.response || reason.response.status >= 500
              ),
              reason: results.length
                ? [...new Set(failures.map(({ reason }) => this.bulkError(reason)))].join('; ')
                : this.$t('TicketBatchStateChanged')
            }
          })
        )
        this.bulkResults = rows.sort((a, b) => Number(a.success) - Number(b.success))
        if (rows.every((row) => row.success)) {
          this.isVisible = false
          this.$message.success(this.bulkSummary)
        }
        this.$refs.BaseTicketList.reloadTable()
      } finally {
        this.bulkLoading = false
      }
    },
    getDetailFields(item) {
      return [
        {
          key: this.$t('Applicant'),
          value: item?.applicant?.name
        },
        ...(item.request_items || [])
          .filter(
            (field) =>
              !item.login_asset_connections?.length ||
              !['apply_login_asset', 'apply_login_account'].includes(field.name)
          )
          .map((field) => ({
            key: field.label,
            value: ['apply_login_datetime', 'apply_date_start', 'apply_date_expired'].includes(
              field.name
            )
              ? toSafeLocalDateStr(field.value)
              : (field.value ?? '-'),
            formatter: Array.isArray(field.value)
              ? (_item, value) => h(TicketValueList, { items: value, label: field.label })
              : undefined
          }))
      ]
    }
  }
}
</script>

<style src="./ticket-list-tabs.css" scoped></style>
<style scoped>
.batch-summary {
  margin: 0 0 20px;
  color: var(--el-text-color-primary);
}
.batch-ticket-number {
  color: var(--el-text-color-secondary);
}
.batch-progress {
  margin-right: 16px;
}
.approval-ticket + .approval-ticket {
  margin-top: 20px;
}
</style>
