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
          <el-form-item :label="$tc('tickets.SystemUser')" :rules="isRequired">
            <Select2 v-model="requestForm.accounts" style="width: 50% !important" />
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
          <el-form-item :label="$tc('assets.Action')" required />
        </el-form>
      </template>
    </IBox>
  </GenericTicketDetail>
</template>

<script>
import { formatTime, getDateTimeStamp } from '@/utils/index'
import { toSafeLocalDateStr } from '@/utils/common'
import { STATUS_MAP } from '../../const'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
import Select2 from '@/components/FormFields/Select2'
import IBox from '@/components/IBox'

export default {
  name: '',
  components: { GenericTicketDetail, IBox, Select2 },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statusMap: this.object.status === 'open' ? STATUS_MAP['pending'] : STATUS_MAP[this.object.state],
      requestForm: {
        nodes: this.object.apply_nodes,
        assets: this.object.apply_assets,
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
            const oid = object.org_id === '' ? 'DEFAULT' : object.org_id
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
            const oid = object.org_id === '' ? 'DEFAULT' : object.org_id
            return `/api/v1/assets/assets/?oid=${oid}&protocol__in=rdp,vnc,ssh,telnet`
          }(this.object)),
          transformOption: (item) => {
            return { label: item.hostname, value: item.id }
          }
        }
      }
    }
  },
  computed: {
    isRequired() {
      if (this.object.approval_step === this.object.process_map.length) {
        return [{ required: true }]
      }
      return [{ required: false }]
    },
    specialCardItems() {
      const { object } = this
      return [
        {
          key: this.$tc('perms.Node'),
          value: object.apply_nodes.map(item => item.value).join(', ')
        },
        {
          key: this.$tc('tickets.Asset'),
          value: object.apply_assets.map(item => item.name).join(', ')
        },
        {
          key: this.$tc('assets.Accounts'),
          value: object.apply_accounts.join(', ')
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
      const rel_snapshot = object.rel_snapshot
      return [
        {
          key: this.$tc('tickets.PermissionName'),
          value: object.apply_permission_name,
          formatter: function(item, value) {
            const to = { name: 'AssetPermissionDetail', params: { id: object.id }, query: { oid: object.org_id }}
            if (vm.$hasPerm('perms.view_assetpermission') && object.status === 'closed' && object.state === 'approved') {
              return <router-link to={to}>{value}</router-link>
            } else {
              return <span>{value}</span>
            }
          }
        },
        {
          key: this.$tc('perms.Node'),
          value: rel_snapshot.apply_nodes.map(item => item.value).join(', ')
        },
        {
          key: this.$tc('assets.Asset'),
          value: rel_snapshot.apply_assets.map(item => item.name).join(', ')
        },
        {
          key: this.$tc('perms.Accounts'),
          value: (rel_snapshot.apply_accounts || []).join(', ')
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
      const approval_step = this.object.approval_step
      const current_user_id = this.$store.state.users.profile.id
      return this.object.process_map[approval_step - 1].assignees.indexOf(current_user_id) !== -1
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
      if (this.object.approval_step === this.object.process_map.length) {
        const assetLength = this.requestForm.assets.length
        const nodeLength = this.requestForm.nodes.length
        if (assetLength === 0 && nodeLength === 0) {
          return this.$message.error(this.$tc('common.SelectAtLeastOneAssetOrNodeErrMsg'))
        } else if (this.requestForm.accounts.length === 0) {
          return this.$message.error(this.$tc('common.RequiredSystemUserErrMsg'))
        }
      }
      this.$axios.patch(`/api/v1/tickets/apply-asset-tickets/${this.object.id}/approve/`, {
        apply_accounts: this.requestForm.accounts ? this.requestForm.accounts : [],
        apply_nodes: this.requestForm.nodes ? this.requestForm.nodes : [],
        apply_assets: this.requestForm.assets ? this.requestForm.assets : [],
        apply_actions: this.requestForm.actions,
        apply_date_start: this.requestForm.apply_date_start,
        apply_date_expired: this.requestForm.apply_date_expired,
        org_id: this.object.org_id
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
