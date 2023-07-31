<template>
  <GenericTicketDetail
    :object="object"
    :special-card-items="specialCardItems"
    :assigned-card-items="assignedCardItems"
    :approve="handleApprove"
    :close="handleClose"
    :reject="handleReject"
  >
    <IBox v-if="hasActionPerm && object.status.value !== 'closed'" class="box">
      <div slot="header" class="clearfix ibox-title">
        <i class="fa fa-edit" /> {{ $tc('common.Actions') }}
      </div>
      <template>
        <el-form ref="requestForm" :model="requestForm" label-width="140px" label-position="left" class="assets">
          <el-form-item :label="$tc('assets.Node')">
            <Select2 v-model="requestForm.nodes" v-bind="nodeSelect2" style="width: 50% !important" />
          </el-form-item>
          <el-form-item :label="$tc('tickets.Asset')">
            <Select2 v-model="requestForm.assets" v-bind="assetSelect2" style="width: 50% !important" />
          </el-form-item>
          <el-form-item :label="$tc('perms.Account')" :rules="isRequired">
            <AccountFormatter
              v-model="requestForm.accounts"
              :nodes="requestForm.nodes"
              :assets="requestForm.assets"
              :show-add-template="false"
              style="width: 50% !important"
            />
          </el-form-item>
          <el-form-item :label="$tc('common.DateStart')" required>
            <el-date-picker
              v-model="requestForm.apply_date_start"
              type="datetime"
            />
          </el-form-item>
          <el-form-item :label="$tc('common.dateExpired')" required>
            <el-date-picker
              v-model="requestForm.apply_date_expired"
              type="datetime"
            />
          </el-form-item>
          <el-form-item :label="$tc('assets.Action')">
            <BasicTree
              v-model="requestForm.actions"
              :tree="treeNodes"
              style="width: 30% !important"
            />

          </el-form-item>
        </el-form>
      </template>
    </IBox>
  </GenericTicketDetail>
</template>

<script>
import { formatTime, getDateTimeStamp } from '@/utils'
import { toSafeLocalDateStr } from '@/utils/common'
import { STATUS_MAP, treeNodes } from '../../const'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter'
import Select2 from '@/components/Form/FormFields/Select2'
import BasicTree from '@/components/Form/FormFields/BasicTree'
import IBox from '@/components/IBox'
import { AccountLabelMapper } from '@/views/perms/const'

export default {
  name: '',
  components: { GenericTicketDetail, IBox, Select2, AccountFormatter, BasicTree },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      treeNodes,
      statusMap: this.object.status.value === 'open' ? STATUS_MAP['pending'] : STATUS_MAP[this.object.state.value],
      requestForm: {
        nodes: this.object.apply_nodes?.map(i => i.id),
        assets: this.object.apply_assets?.map(i => i.id),
        accounts: this.object.apply_accounts,
        actions: this.object.apply_actions,
        apply_date_expired: this.object.apply_date_expired,
        apply_date_start: this.object.apply_date_start
      },
      nodeSelect2: {
        multiple: true,
        value: this.object.apply_nodes,
        ajax: {
          url: (function(object) {
            const oid = object.org_id
            return `/api/v1/assets/nodes/?oid=${oid}&protocol__in=rdp,vnc,ssh,telnet`
          }(this.object)),
          transformOption: (item) => {
            return { label: `${item.full_value}`, value: item.id }
          }
        }
      },
      assetSelect2: {
        multiple: true,
        value: this.object.apply_assets,
        ajax: {
          url: (function(object) {
            const oid = object.org_id
            return `/api/v1/assets/assets/?oid=${oid}&protocol__in=rdp,vnc,ssh,telnet`
          }(this.object)),
          transformOption: (item) => {
            return { label: `${item.name}(${item.address})`, value: item.id }
          }
        }
      }
    }
  },
  computed: {
    isRequired() {
      if (this.object.approval_step.value === this.object.process_map.length) {
        return [{ required: true }]
      }
      return [{ required: false }]
    },
    specialCardItems() {
      const { object } = this
      return [
        {
          key: this.$tc('perms.Node'),
          value: object.apply_nodes.map(item => item.name).join(', ')
        },
        {
          key: this.$tc('tickets.Asset'),
          value: object.apply_assets.map(item => item.name).join(', ')
        },
        {
          key: this.$tc('perms.Account'),
          value: object.apply_accounts.map(item => AccountLabelMapper[item] || item).join(', ')
        },
        {
          key: this.$tc('assets.Action'),
          value: object.apply_actions.map(item => item.label).join(', ')
        },
        {
          key: this.$tc('common.DateStart'),
          value: object.apply_date_start
        },
        {
          key: this.$tc('common.dateExpired'),
          value: object.apply_date_expired
        }
      ]
    },
    assignedCardItems() {
      const vm = this
      const { object } = this
      return [
        {
          key: this.$tc('tickets.PermissionName'),
          value: object.apply_permission_name,
          formatter: function(item, value) {
            const to = { name: 'AssetPermissionDetail', params: { id: object.id }, query: { oid: object.org_id }}
            if (vm.$hasPerm('perms.view_assetpermission') && object.status.value === 'closed' && object.state.value === 'approved') {
              return <router-link to={to}>{value}</router-link>
            } else {
              return <span>{value}</span>
            }
          }
        },
        {
          key: this.$tc('perms.Node'),
          value: object.apply_nodes.map(item => item.name).join(', ')
        },
        {
          key: this.$tc('assets.Asset'),
          value: object.apply_assets.map(item => item.name).join(', ')
        },
        {
          key: this.$tc('perms.Account'),
          value: object.apply_accounts.map(item => AccountLabelMapper[item] || item).join(', ')
        },
        {
          key: this.$tc('assets.Action'),
          value: object.apply_actions.map(item => item.label).join(', ')
        },
        {
          key: this.$tc('common.DateStart'),
          value: object.apply_date_start
        },
        {
          key: this.$tc('common.dateExpired'),
          value: object.apply_date_expired
        }
      ]
    },
    hasActionPerm() {
      const approval_step = this.object.approval_step.value
      const current_user_id = this.$store.state.users.profile.id
      return this.object.process_map.filter(
        item => item.approval_level === approval_step
      )[0].assignees.indexOf(current_user_id) !== -1
    }
  },
  methods: {
    formatTime(dateStr) {
      return formatTime(getDateTimeStamp(dateStr))
    },
    toSafeLocalDateStr(dataStr) {
      return toSafeLocalDateStr(dataStr)
    },
    reloadPage() {
      window.location.reload()
    },
    handleApprove() {
      const nodes = this.requestForm.nodes
      const assets = this.requestForm.assets
      const accounts = this.requestForm.accounts
      if (this.object.approval_step.value === this.object.process_map.length) {
        if (assets.length === 0 && nodes.length === 0) {
          return this.$message.error(this.$tc('common.SelectAtLeastOneAssetOrNodeErrMsg'))
        } else if (accounts.length === 0) {
          return this.$message.error(this.$tc('common.RequiredSystemUserErrMsg'))
        }
      }
      this.$axios.patch(`/api/v1/tickets/apply-asset-tickets/${this.object.id}/approve/`, {
        apply_nodes: nodes || [],
        apply_assets: assets || [],
        apply_accounts: accounts || [],
        org_id: this.object.org_id,
        apply_actions: this.requestForm.actions,
        apply_date_start: this.requestForm.apply_date_start,
        apply_date_expired: this.requestForm.apply_date_expired
      }).then(() => {
        this.$message.success(this.$tc('common.updateSuccessMsg'))
        this.reloadPage()
      }).catch(() => {
        this.$message.success(this.$tc('common.updateErrorMsg'))
      })
    },
    handleClose() {
      const url = `/api/v1/tickets/apply-asset-tickets/${this.object.id}/close/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    handleReject() {
      const url = `/api/v1/tickets/apply-asset-tickets/${this.object.id}/reject/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    }
  }
}
</script>

<style scoped>
  .assets {
    margin-top: 14px;
  }

  .feed-activity-list .feed-element {
    border-bottom: 1px solid #e7eaec;
  }

  .feed-element > .pull-left {
    margin-right: 10px;
  }

  .feed-element .header-avatar {
    width: 38px;
    height: 38px;
  }

  .box {
    margin-bottom: 15px;
  }
</style>
