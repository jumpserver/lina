<template>
  <GenericTicketDetail
    :object="object"
    :detail-card-items="detailCardItems"
    :special-card-items="specialCardItems"
    :approve="handleApprove"
  >
    <IBox v-if="hasActionPerm&&object.status !== 'closed'" class="box">
      <div slot="header" class="clearfix ibox-title">
        <i class="fa fa-info-circle" /> {{ $t('common.Actions') }}
      </div>
      <template>
        <el-form ref="request_form" :model="request_form" label-width="140px" label-position="left" class="assets">
          <el-form-item :label="$t('tickets.Asset')" required>
            <Select2 ref="select2" v-model="request_form.asset" v-bind="asset_select2" style="width: 30% !important" />
          </el-form-item>
          <el-form-item :label="$t('tickets.SystemUser')" required>
            <Select2 ref="select2" v-model="request_form.systemuser" v-bind="systemuser_select2" style="width: 30% !important" />
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
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
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
      statusMap: this.object.status === 'open' ? STATUS_MAP[this.object.status] : STATUS_MAP[this.object.action],
      request_form: {
        asset: this.object.confirmed_assets,
        systemuser: ''
      },
      comments: '',
      assets: [],
      asset_select2: {
        multiple: true,
        value: this.object.confirmed_assets,
        ajax: {
          url: this.object.assets_waitlist_url,
          transformOption: (item) => {
            return { label: item.hostname, value: item.id }
          }
        }
      },
      systemuser_select2: {
        multiple: false,
        ajax: {
          url: this.object.system_user_waitlist_url,
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
          value: this.object.user_display
        },
        {
          key: this.$t('tickets.Assignees'),
          value: this.object.assignees_display
        },
        {
          key: this.$t('tickets.Assignee'),
          value: this.object.assignee_display
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
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
          value: this.object.ips
        },
        {
          key: this.$t('tickets.Hostname'),
          value: this.object.hostname
        },
        {
          key: this.$t('common.dateStart'),
          value: toSafeLocalDateStr(this.object.date_start)
        },
        {
          key: this.$t('common.dateExpired'),
          value: toSafeLocalDateStr(this.object.date_expired)
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
    createComment(successCallback) {
      const commentText = this.form.comments
      const ticketId = this.object.id
      const commentUrl = `/api/v1/tickets/tickets/${ticketId}/comments/`
      if (!commentText) { return }
      const body = {
        body: commentText,
        ticket: ticketId
      }
      this.$axios.post(commentUrl, body).then(res => {
        if (successCallback) {
          successCallback()
        } else {
          this.reloadPage()
        }
      })
    },
    handleApprove() {
      if (this.request_form.asset.length === 0 || this.request_form.systemuser === '') {
        return this.$message.error(this.$t('common.NeedAssetsAndSystemUserErrMsg'))
      } else {
        this.$axios.patch(`/api/v1/tickets/tickets/request-asset-perm/${this.object.id}/`, {
          confirmed_system_user: this.request_form.systemuser,
          confirmed_assets: this.request_form.asset
        }).then(res => {
          this.$axios.post(`/api/v1/tickets/tickets/request-asset-perm/${this.object.id}/approve/`).then(
            () => {
              this.$message.success(this.$t('common.updateSuccessMsg'))
              this.reloadPage()
            }
          )
        }).catch(
          () => this.$message.success(this.$t('common.updateErrorMsg'))
        )
      }
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
