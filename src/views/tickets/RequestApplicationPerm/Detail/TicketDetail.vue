<template>
  <GenericTicketDetail
    :object="object"
    :detail-card-items="detailCardItems"
    :special-card-items="specialCardItems"
    :assigned-card-items="assignedCardItems"
    :approve="handleApprove"
    :close="handleClose"
    :reject="handleReject"
  />
</template>

<script>
import { formatTime, getDateTimeStamp } from '@/utils/index'
import { toSafeLocalDateStr } from '@/utils/common'
import { STATUS_MAP } from '../../const'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
export default {
  name: '',
  components: { GenericTicketDetail },
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
        application: this.object.apply_applications,
        systemuser: this.object.apply_system_users,
        apply_date_expired: this.object.apply_date_expired,
        apply_date_start: this.object.apply_date_start
      },
      comments: '',
      assets: []
    }
  },
  computed: {
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
      if (this.requestForm.application.length === 0 || this.requestForm.systemuser.length === 0) {
        return this.$message.error(this.$tc('common.NeedAssetsAndSystemUserErrMsg'))
      } else {
        this.$axios.put(`/api/v1/tickets/apply-app-tickets/${this.object.id}/approve/`, {
          meta: {}
        }).then(
          () => {
            this.$message.success(this.$tc('common.updateSuccessMsg'))
            this.reloadPage()
          }
        ).catch(
          () => this.$message.success(this.$tc('common.updateErrorMsg'))
        )
      }
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
