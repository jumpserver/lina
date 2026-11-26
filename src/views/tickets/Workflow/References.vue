<template>
  <Dialog
    :visible="true"
    :title="`${$t('WFReferences')} · ${workflow.display_name || workflow.name}`"
    :show-buttons="false"
    @update:visible="$emit('close')"
  >
    <el-alert v-if="reason" :title="reason" type="warning" :closable="false" show-icon />
    <el-table v-loading="loading" :data="rows" :empty-text="error || $t('WFNoVisibleReferences')">
      <el-table-column :label="$t('Type')" width="130">
        <template #default="{ row }">{{ $t(kinds[row.kind].label) }}</template>
      </el-table-column>
      <el-table-column :label="$t('Name')" min-width="190">
        <template #default="{ row }">
          <router-link
            v-if="kinds[row.kind].route"
            class="reference-link"
            :to="detailRoute(row)"
            target="_blank"
            rel="noopener"
          >
            {{ row.record_number ? `#${row.record_number} · ` : '' }}{{ row.record_name }}
          </router-link>
          <span v-else>{{ row.record_name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="org_name" :label="$t('Organization')" width="110" />
      <el-table-column :label="$t('WFHowToHandle')" min-width="220">
        <template #default="{ row }">{{ $t(kinds[row.kind].hint) }}</template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > pageSize"
      layout="prev, pager, next, total"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :disabled="loading"
      @current-change="load"
    />
  </Dialog>
</template>

<script>
import { getTicketDetailRoute } from '../plugins/registry'
import Dialog from '@/components/Dialog'
import { getErrorResponseMsg } from '@/utils/common'

const kinds = {
  loginacl: { label: 'UserLoginACLs', route: 'UserLoginACLDetail', hint: 'WFChangeLinkedRule' },
  loginassetacl: { label: 'WFAssetLoginRule', route: 'AssetACLDetail', hint: 'WFChangeLinkedRule' },
  commandfilteracl: {
    label: 'CommandFilterACL',
    route: 'CommandFilterACLDetail',
    hint: 'WFChangeLinkedRule'
  },
  ticket: { label: 'Ticket', route: 'TicketDetail', hint: 'WFKeepApprovalHistory' },
  workflow: { label: 'WFCombinedReference', hint: 'WFKeepApprovalHistory' }
}

export default {
  components: { Dialog },
  props: { workflow: { type: Object, required: true }, reason: { type: String, default: '' } },
  emits: ['close'],
  data() {
    return { kinds, rows: [], page: 1, pageSize: 10, total: 0, loading: false, error: '' }
  },
  created() {
    this.load(1)
  },
  methods: {
    detailRoute(row) {
      const name =
        row.kind === 'ticket' ? getTicketDetailRoute(row.ticket_type) : kinds[row.kind].route
      return { name, params: { id: row.id }, query: { oid: row.record_org } }
    },
    async load(page) {
      this.loading = true
      this.error = ''
      try {
        const data = await this.$axios.get(
          `/api/v1/tickets/workflows/${this.workflow.id}/references/`,
          {
            params: { limit: this.pageSize, offset: (page - 1) * this.pageSize },
            disableFlashErrorMsg: true
          }
        )
        this.page = page
        this.rows = data.results
        this.total = data.count
      } catch (error) {
        this.rows = []
        this.error = getErrorResponseMsg(error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.reference-link {
  color: var(--el-color-primary);
  text-decoration: underline;
}
</style>
