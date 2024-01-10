<template>
  <div>
    <BaseTicketList ref="BaseTicketList" :url="url" v-bind="$data" />
    <Dialog
      v-if="isVisible"
      :cancel-title="$tc('BatchReject')"
      :confirm-title="$tc('BatchConsent')"
      :destroy-on-close="true"
      :title="$tc('BatchApproval')"
      :visible.sync="isVisible"
      width="70%"
      @cancel="onCancel"
      @confirm="onConfirm"
    >
      <div v-for="d in ticketData" :key="d.id">
        <AutoDetailCard :fields="getDetailFields(d)" :object="d" :title="`${d.title}(${d.type.label})`" :url="detailUrl" />
      </div>
    </Dialog>
  </div>

</template>

<script>
import BaseTicketList from './BaseTicketList'
import { mapGetters } from 'vuex'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import Dialog from '@/components/Dialog'

export default {
  name: 'AssignedTicketList',
  components: {
    Dialog,
    AutoDetailCard,
    BaseTicketList
  },
  data() {
    return {
      ticketData: [],
      detailUrl: `/api/v1/tickets/tickets/`,
      isVisible: false,
      extraTicketAction: {
        hasCreate: false,
        hasMoreActions: true,
        extraMoreActions: [
          {
            name: 'BatchApproval',
            title: this.$t('BatchApproval'),
            can: ({ selectedRows }) => { return selectedRows.length > 0 },
            callback: function({ selectedRows }) {
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
      return `/api/v1/tickets/tickets/?assignees__id=${this.currentUser.id}`
    },
    ...mapGetters([
      'currentUser'
    ])
  },
  methods: {
    getAjaxData() {
      let ticketType
      const data = {}
      this.ticketData.map(item => {
        switch (item.type.value) {
          case 'apply_asset':
            ticketType = 'apply-asset-tickets'
            break
          case 'login_confirm':
            ticketType = 'apply-login-tickets'
            break
          case 'command_confirm':
            ticketType = 'apply-command-tickets'
            break
          case 'login_asset_confirm':
            ticketType = 'apply-login-asset-tickets'
            break
        }
        if (!data.hasOwnProperty(ticketType)) {
          data[ticketType] = []
        }
        data[ticketType].push(item.id)
      })
      return data
    },
    onConfirm() {
      this.bulk('approve')
    },
    onCancel() {
      this.bulk('reject')
    },
    bulk(action) {
      let current = 0
      const data = this.getAjaxData()
      const dataLength = Object.keys(data).length
      for (const ticketType in data) {
        current += 1
        this.$axios.put(
          `/api/v1/tickets/${ticketType}/bulk/?action=${action}`,
          { tickets: data[ticketType] }
        ).then(res => {
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          if (current === dataLength) {
            this.$refs.BaseTicketList.reloadTable()
            this.isVisible = false
          }
        }).catch(err => {
          const errMsg = Object.values(err.response.data).join(', ')
          this.$message.error(this.$tc('UpdateErrorMsg') + ' ' + errMsg)
        })
      }
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
        detailFields = detailFields.concat(
          [
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
          ]
        )
      } else if (ticketType === 'apply_asset') {
        detailFields = detailFields.concat(
          [
            {
              key: this.$t('Asset'),
              value: item?.rel_snapshot?.apply_assets.join(', ')
            },
            {
              key: this.$t('Node'),
              value: item?.rel_snapshot?.apply_nodes.join(', ')
            }
          ]
        )
      } else if (ticketType === 'login_asset_confirm') {
        detailFields = detailFields.concat(
          [
            {
              key: this.$t('ApplyLoginAsset'),
              value: item?.rel_snapshot?.apply_login_asset
            },
            {
              key: this.$t('ApplyLoginUser'),
              value: item?.rel_snapshot?.apply_login_user
            }
          ]
        )
      }
      return detailFields
    }
  }
}
</script>

<style scoped>
</style>
