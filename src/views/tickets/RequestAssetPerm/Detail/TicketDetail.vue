<template>
  <GenericTicketDetail
    :object="object"
    :detail-card-items="detailCardItems"
    :special-card-items="specialCardItems"
    :assigned-card-items="assignedCardItems"
    :approve="handleApprove"
    :close="handleClose"
    :reject="handleReject"
  >
    <IBox v-if="hasActionPerm&&object.status !== 'closed'" class="box">
      <div slot="header" class="clearfix ibox-title">
        <i class="fa fa-edit" /> {{ $t('common.Actions') }}
      </div>
      <template>
        <el-form ref="requestForm" :model="requestForm" label-width="140px" label-position="left" class="assets">
          <el-form-item :label="$t('perms.PermName')" required>
            <el-input v-model="requestForm.name" />
          </el-form-item>
          <el-form-item :label="$t('tickets.Asset')" required>
            <Select2 v-model="requestForm.asset" v-bind="asset_select2" style="width: 50% !important" />
          </el-form-item>
          <el-form-item :label="$t('tickets.SystemUser')" required>
            <Select2 v-model="requestForm.systemuser" v-bind="systemuser_select2" style="width: 50% !important" />
          </el-form-item>
          <el-form-item :label="$t('common.dateStart')" required>
            <el-date-picker
              v-model="requestForm.apply_date_start"
              type="datetime"
            />
          </el-form-item>
          <el-form-item :label="$t('common.dateExpired')" required>
            <el-date-picker
              v-model="requestForm.apply_date_expired"
              type="datetime"
            />
          </el-form-item>
          <el-form-item :label="$t('assets.Action')" required>
            <AssetPermissionFormActionField v-model="requestForm.actions" style="width: 30% !important" />
          </el-form-item>
        </el-form>
      </template>
    </IBox>
  </GenericTicketDetail>
</template>

<script>
import { formatTime, getDateTimeStamp } from '@/utils/index'
import { toSafeLocalDateStr } from '@/utils/common'
import { STATUS_MAP } from '../../const'
import Select2 from '@/components/Select2'
import IBox from '@/components/IBox'
import AssetPermissionFormActionField from '@/views/perms/AssetPermission/components/AssetPermissionFormActionField'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
export default {
  name: '',
  components: { GenericTicketDetail, IBox, Select2, AssetPermissionFormActionField },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statusMap: this.object.status === 'open' ? STATUS_MAP[this.object.status] : STATUS_MAP[this.object.action],
      requestForm: {
        name: this.object.meta.approve_permission_name,
        asset: this.object.meta.recommend_assets,
        systemuser: this.object.meta.recommend_system_users,
        actions: this.object.meta.apply_actions,
        apply_date_expired: this.object.meta.apply_date_expired,
        apply_date_start: this.object.meta.apply_date_start
      },
      comments: '',
      assets: [],
      asset_select2: {
        multiple: true,
        value: this.object.meta.recommend_assets,
        ajax: {
          url: `/api/v1/assets/assets/?oid=${(this.object.org_id === '') ? 'DEFAULT' : this.object.org_id}&protocol__in=rdp,vnc,ssh,telnet`,
          transformOption: (item) => {
            return { label: item.hostname, value: item.id }
          }
        }
      },
      systemuser_select2: {
        multiple: true,
        value: this.object.meta.recommend_system_users,
        ajax: {
          url: `/api/v1/assets/system-users/?oid=${(this.object.org_id === '') ? 'DEFAULT' : this.object.org_id}&protocol__in=rdp,vnc,ssh,telnet`,
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        }
      }
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('tickets.status'),
          value: this.object.status,
          formatter: (item, val) => {
            return <el-tag type={this.statusMap.type} size='mini'> { this.statusMap.title }</el-tag>
          }
        },
        {
          key: this.$t('tickets.type'),
          value: this.object.type_display
        },
        {
          key: this.$t('tickets.user'),
          value: this.object.applicant_display
        },
        {
          key: this.$t('tickets.Assignees'),
          value: this.object.assignees_display
        },
        {
          key: this.$t('tickets.Assignee'),
          value: (this.object.processor_display === 'No') ? '' : this.object.processor_display
        },
        {
          key: this.$t('tickets.OrgName'),
          value: this.object.org_name
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    },
    specialCardItems() {
      return [
        // {
        //   key: this.$t('tickets.Assignee'),
        //   value: this.object.assignee_display
        // },
        {
          key: this.$t('tickets.IP'),
          value: this.object.meta.apply_ip_group.toString()
        },
        {
          key: this.$t('tickets.Hostname'),
          value: this.object.meta.apply_hostname_group.toString()
        },
        {
          key: this.$t('tickets.SystemUser'),
          value: this.object.meta.apply_system_user_group.toString()
        },
        {
          key: this.$t('common.dateStart'),
          value: toSafeLocalDateStr(this.object.meta.apply_date_start)
        },
        {
          key: this.$t('common.dateExpired'),
          value: toSafeLocalDateStr(this.object.meta.apply_date_expired)
        }
      ]
    },
    assignedCardItems() {
      return [
        {
          key: this.$t('assets.Asset'),
          value: this.object.meta.approve_assets_display
        },
        {
          key: this.$t('tickets.SystemUser'),
          value: this.object.meta.approve_system_users_display
        },
        {
          key: this.$t('common.dateStart'),
          value: toSafeLocalDateStr(this.object.meta.approve_date_start)
        },
        {
          key: this.$t('common.dateExpired'),
          value: toSafeLocalDateStr(this.object.meta.approve_date_expired)
        }
      ]
    },
    hasActionPerm() {
      return this.object.assignees.indexOf(this.$store.state.users.profile.id) !== -1
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
      if (this.requestForm.asset.length === 0 || this.requestForm.systemuser.length === 0) {
        return this.$message.error(this.$t('common.NeedAssetsAndSystemUserErrMsg'))
      } else {
        this.$axios.put(`/api/v1/tickets/tickets/${this.object.id}/approve/`, {
          meta: {
            approve_permission_name: this.requestForm.name,
            approve_system_users: this.requestForm.systemuser,
            approve_assets: this.requestForm.asset,
            approve_actions: this.requestForm.actions,
            approve_date_start: this.requestForm.apply_date_start,
            approve_date_expired: this.requestForm.apply_date_expired
          }
        }).then(
          () => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
            this.reloadPage()
          }
        ).catch(
          () => this.$message.success(this.$t('common.updateErrorMsg'))
        )
      }
    },
    handleClose() {
      const url = `/api/v1/tickets/tickets/${this.object.id}/close/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    handleReject() {
      const url = `/api/v1/tickets/tickets/${this.object.id}/reject/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    }
  }
}
</script>

<style scoped>
  .assets{
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
