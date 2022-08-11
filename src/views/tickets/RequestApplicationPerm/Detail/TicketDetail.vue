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
          <el-form-item :label="$t('assets.Applications')" :rules="isRequired">
            <Select2 v-model="requestForm.applications" v-bind="appsSelect2" style="width: 50% !important" />
          </el-form-item>
          <el-form-item :label="$t('tickets.SystemUser')" :rules="isRequired">
            <Select2 v-model="requestForm.systemusers" v-bind="systemuserSelect2" style="width: 50% !important" />
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
            <PermissionFormActionField
              v-model="requestForm.actions"
              :value="requestForm.actions"
              :actions="actions"
              style="width: 30% !important"
            />
          </el-form-item>
        </el-form>
      </template>
    </IBox>
  </GenericTicketDetail>
</template>

<script>
import IBox from '@/components/IBox'
import { toSafeLocalDateStr, forMatAction } from '@/utils/common'
import Select2 from '@/components/FormFields/Select2'
import { formatTime, getDateTimeStamp } from '@/utils/index'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
import PermissionFormActionField from '@/views/perms/components/PermissionFormActionField'
import { STATUS_MAP } from '../../const'
export default {
  name: '',
  components: { GenericTicketDetail, IBox, Select2, PermissionFormActionField },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statusMap: this.object.status === 'open' ? STATUS_MAP['pending'] : STATUS_MAP[this.object.state],
      actions: this.dynamicActions(),
      requestForm: {
        applications: this.object.apply_applications,
        systemusers: this.object.apply_system_users,
        actions: this.object.apply_actions,
        apply_date_expired: this.object.apply_date_expired,
        apply_date_start: this.object.apply_date_start
      },
      appsSelect2: {
        multiple: true,
        value: this.object.apply_applications,
        ajax: {
          url: function() {
            const oid = this.object.org_id
            return `/api/v1/applications/applications/?oid=${oid}&type=${this.object.apply_type}`
          }.bind(this)(),
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        }
      },
      systemuserSelect2: {
        multiple: true,
        value: this.object.apply_system_users,
        ajax: {
          url: function() {
            const oid = this.object.org_id
            const protocol = this.object.apply_category === 'remote_app' ? 'rdp' : this.object.apply_type
            return `/api/v1/assets/system-users/?oid=${oid}&protocol=${protocol}`
          }.bind(this)(),
          transformOption: (item) => {
            const username = item.username || '*'
            return { label: item.name + '(' + username + ')', value: item.id }
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
    detailCardItems() {
      const { object } = this
      return [
        {
          key: this.$t('common.Number'),
          value: object.serial_num
        },
        {
          key: this.$t('tickets.status'),
          value: object.status,
          formatter: (item, val) => {
            return <el-tag type={this.statusMap.type} size='mini'> { this.statusMap.title }</el-tag>
          }
        },
        {
          key: this.$t('tickets.type'),
          value: object.type_display
        },
        {
          key: this.$t('tickets.user'),
          value: object.rel_snapshot.applicant
        },
        {
          key: this.$t('tickets.OrgName'),
          value: object.org_name
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(object.date_created)
        },
        {
          key: this.$t('common.Comment'),
          value: object.comment
        }
      ]
    },
    specialCardItems() {
      const { object } = this
      const rel_snapshot = object.rel_snapshot
      return [
        {
          key: this.$t('applications.appType'),
          value: `${object.apply_category} / ${object.apply_type} `
        },
        {
          key: this.$t('applications.appName'),
          value: rel_snapshot.apply_applications.join(', ')
        },
        {
          key: this.$t('tickets.SystemUser'),
          value: rel_snapshot.apply_system_users.join(', ')
        },
        {
          key: this.$t('assets.Action'),
          value: forMatAction(this, object.apply_actions_display)
        },
        {
          key: this.$t('common.dateStart'),
          value: toSafeLocalDateStr(object.apply_date_start)
        },
        {
          key: this.$t('common.dateExpired'),
          value: toSafeLocalDateStr(object.apply_date_expired)
        }
      ]
    },
    assignedCardItems() {
      const vm = this
      const { object } = this
      const rel_snapshot = object.rel_snapshot
      return [
        {
          key: this.$t('tickets.PermissionName'),
          value: vm.object.apply_permission_name,
          formatter: function(item, value) {
            const to = { name: 'ApplicationPermissionDetail', params: { id: object.id }, query: { oid: object.org_id }}
            if (vm.$hasPerm('perms.view_applicationpermission') && object.status === 'closed' && object.state === 'approved') {
              return <router-link to={to}>{ value }</router-link>
            } else {
              return <span>{ value }</span>
            }
          }
        },
        {
          key: this.$t('applications.appName'),
          value: rel_snapshot.apply_applications.join(', ')
        },
        {
          key: this.$t('tickets.SystemUser'),
          value: rel_snapshot.apply_system_users.join(', ')
        },
        {
          key: this.$t('common.dateStart'),
          value: toSafeLocalDateStr(object.apply_date_start)
        },
        {
          key: this.$t('common.dateExpired'),
          value: toSafeLocalDateStr(object.apply_date_expired)
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
    dynamicActions() {
      const category = this.object.apply_category
      const actions = []
      this.$axios.get(
        `/api/v1/perms/application-permissions/applications/actions/?category=${category}`,
      ).then(res => {
        actions.push(...res)
      })
      return actions
    },
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
        if (this.requestForm.applications.length === 0 || this.requestForm.systemusers.length === 0) {
          return this.$message.error(this.$tc('common.NeedAddAppsOrSystemUserErrMsg'))
        }
      }
      this.$axios.patch(`/api/v1/tickets/apply-app-tickets/${this.object.id}/approve/`, {
        apply_category: this.object.apply_category,
        apply_type: this.object.apply_type,
        apply_system_users: this.requestForm.systemusers ? this.requestForm.systemusers : [],
        apply_applications: this.requestForm.applications ? this.requestForm.applications : [],
        apply_actions: this.requestForm.actions,
        apply_date_start: this.requestForm.apply_date_start,
        apply_date_expired: this.requestForm.apply_date_expired,
        org_id: this.object.org_id
      }).then(
        () => {
          this.$message.success(this.$tc('common.updateSuccessMsg'))
          this.reloadPage()
        }
      ).catch(
        () => this.$message.success(this.$tc('common.updateErrorMsg'))
      )
    },
    handleClose() {
      const url = `/api/v1/tickets/apply-app-tickets/${this.object.id}/close/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    handleReject() {
      const url = `/api/v1/tickets/apply-app-tickets/${this.object.id}/reject/`
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
