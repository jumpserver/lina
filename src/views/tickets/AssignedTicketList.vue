<template>
  <div>
    <el-tabs v-model="tab"
      ><el-tab-pane name="pending" :label="$t('AwaitingMyApproval')" /><el-tab-pane
        name="processed"
        :label="$t('WFProcessedByMe')"
    /></el-tabs>
    <BaseTicketList
      v-bind="$data"
      :key="tab"
      ref="BaseTicketList"
      :url="url"
      :extra-ticket-action="tab === 'pending' ? extraTicketAction : { hasCreate: false }"
    />
    <Dialog
      v-if="isVisible"
      v-model:visible="isVisible"
      :cancel-title="$tc('BatchReject')"
      :confirm-title="$tc('BatchConsent')"
      :destroy-on-close="true"
      :title="$tc('ApprovalSelected')"
      width="70%"
      @cancel="onCancel"
      @confirm="onConfirm"
    >
      <div v-for="d in ticketData" :key="d.id">
        <AutoDetailCard
          :fields="getDetailFields(d)"
          :object="d"
          :title="`${d.title}(${ticketTypeLabel(d.type)})`"
          :url="detailUrl"
        />
      </div>
    </Dialog>
  </div>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import Dialog from '@/components/Dialog'
import { mapGetters } from 'vuex'
import BaseTicketList from './BaseTicketList'
import { getTicketTypeLabel } from './const'

export default {
  name: 'AssignedTicketList',
  components: {
    Dialog,
    AutoDetailCard,
    BaseTicketList
  },
  data() {
    return {
      tab: 'pending',
      ticketData: [],
      detailUrl: `/api/v1/tickets/tickets/`,
      isVisible: false,
      extraTicketAction: {
        hasCreate: false,
        hasMoreActions: true,
        extraMoreActions: [
          {
            name: 'ApproveSelected',
            title: this.$t('ApprovalSelected'),
            icon: 'fa-solid fa-check',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0
            },
            callback: function ({ selectedRows }) {
              this.isVisible = true
              this.ticketData = selectedRows
            }.bind(this)
          }
        ]
      }
    }
  },
  computed: {
    url() {
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
    onConfirm() {
      this.bulk('approve')
    },
    onCancel() {
      this.bulk('reject')
    },
    async bulk(action) {
      const results = await Promise.allSettled(
        this.ticketData.flatMap((ticket) =>
          (ticket.my_tasks || []).map((task) =>
            this.$axios.post(
              `/api/v1/tickets/approval-tasks/${task}/${action}/`,
              {},
              { params: { oid: ticket.org_id } }
            )
          )
        )
      )
      this.$refs.BaseTicketList.reloadTable()
      this.isVisible = false
      const failed = results.filter((r) => r.status === 'rejected').length
      if (failed) this.$message.warning(this.$t('WFBulkFailed', { count: failed }))
      else this.$message.success(this.$t('UpdateSuccessMsg'))
    },
    getDetailFields(item) {
      const ticketType = item?.type?.value
      let detailFields = [
        {
          key: this.$t('Applicant'),
          value: item?.applicant?.name
        }
      ]
      if (ticketType === 'command_confirm') {
        detailFields = detailFields.concat([
          {
            key: this.$t('ApplyFromCMDFilterRule'),
            value: item?.rel_snapshot?.apply_from_cmd_filter_acl
          },
          {
            key: this.$t('ApplyFromSession'),
            value: item?.rel_snapshot?.apply_from_session
          },
          {
            key: this.$t('ApplyRunUser'),
            value: item?.rel_snapshot?.apply_run_user
          }
        ])
      } else if (ticketType === 'apply_asset') {
        detailFields = detailFields.concat([
          {
            key: this.$t('Asset'),
            value: item?.rel_snapshot?.apply_assets.join(', ')
          },
          {
            key: this.$t('Node'),
            value: item?.rel_snapshot?.apply_nodes.join(', ')
          }
        ])
      } else if (ticketType === 'login_asset_confirm') {
        detailFields = detailFields.concat([
          {
            key: this.$t('ApplyLoginAsset'),
            value: item?.rel_snapshot?.apply_login_asset
          },
          {
            key: this.$t('ApplyLoginUser'),
            value: item?.rel_snapshot?.apply_login_user
          }
        ])
      }
      return detailFields
    }
  }
}
</script>
