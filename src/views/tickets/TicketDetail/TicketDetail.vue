<template>
  <el-row>
    <DetailCard :title="cardTitle" :items="detailCardItems">
      <div class="feed-activity-list">
        <div class="feed-element">
          <a href="#" class="pull-left">
            <el-avatar :src="imageUrl" class="header-avatar" />
          </a>
          <div class="media-body ">
            <strong>{{ object.user_display }}</strong> <small class="text-muted"> {{ formatTime(object.date_created) }}</small>
            <br>
            <small class="text-muted">{{ toSafeLocalDateStr(object.date_created) }} </small>
            <div style="padding-top: 10px">
              <span v-html="object.body" />
            </div>
          </div>
        </div>
        <template v-if="comments">
          <div v-for="item in comments" :key="item.user_display + item.body">
            <div class="feed-element">
              <a href="#" class="pull-left">
                <el-avatar :src="imageUrl" class="header-avatar" />
              </a>
              <div class="media-body ">
                <strong>{{ item.user_display }}</strong> <small class="text-muted">{{ formatTime(item.date_created) }}</small>
                <br>
                <small class="text-muted">{{ toSafeLocalDateStr(item.date_created) }}</small>
                <div style="padding-top: 10px">
                  {{ item.body }}
                </div>
              </div>
            </div>
          </div>
        </template>
        <el-form ref="comments" :model="form" label-width="45px" style="padding-top: 20px">
          <el-form-item label="回复">
            <el-input v-model="form.comments" type="textarea" :autosize="{ minRows: 4 }" />
          </el-form-item>
          <el-form-item style="float: right">
            <template v-if="hasActionPerm">
              <el-button type="primary" size="small" :disabled="object.status === 'closed'" @click="handleApprove"><i class="fa fa-check" />同意</el-button>
              <el-button type="warning" size="small" :disabled="object.status === 'closed'" @click="handleReject"><i class="fa fa-ban" />拒绝</el-button>
            </template>
            <el-button type="danger" size="small" :disabled="object.status === 'closed'" @click="handleClosed"><i class="fa fa-times" />关闭</el-button>
            <el-button type="info" size="small" :disabled="object.status === 'closed'" @click="handleComment"><i class="fa fa-pencil" />备注</el-button>
          </el-form-item>
        </el-form>
      </div>
    </DetailCard>
  </el-row>
</template>

<script>
import { DetailCard } from '@/components'
import { formatTime, getDateTimeStamp } from '@/utils/index'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'TicketDetail',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      imageUrl: require('@/assets/img/admin.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    cardTitle() {
      return this.object.title
    },
    detailCardItems() {
      return [
        {
          key: this.$t('tickets.user'),
          value: this.object.user_display
        },
        {
          key: this.$t('tickets.type'),
          value: this.object.type_display
        },
        {
          key: this.$t('tickets.status'),
          value: this.object.status,
          callback: function(row, data) {
            if (data === 'open') {
              return <el-button type='primary' size='mini'>开启</el-button>
            }
            return <el-button type='danger' size='mini'>关闭</el-button>
          }
        },
        {
          key: this.$t('tickets.Assignees'),
          value: this.object.assignees_display
        },
        {
          key: this.$t('tickets.Assignee'),
          value: this.comments,
          callback: function(row, data) {
            if (data.length !== 0) {
              return <span>{data[0].user_display}</span>
            }
            return <span></span>
          }
        },
        {
          key: this.$t('common.DateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        }
      ]
    },
    hasActionPerm() {
      return this.object.assignees.indexOf(this.$store.state.user.user.id) !== -1
    }
  },
  mounted() {
    const url = `/api/v1/tickets/tickets/${this.object.id}/comments/`
    this.$axios.get(url).then(res => {
      this.comments = res
    }).catch(err => this.$message.error(this.$t(err)))
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
      this.createComment(function() {})
      const url = `/api/v1/tickets/tickets/${this.object.id}/`
      const data = { action: 'approve' }
      this.$axios.patch(url, data).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    handleReject() {
      this.createComment(function() {})
      const url = `/api/v1/tickets/tickets/${this.object.id}/`
      const data = { action: 'reject' }
      this.$axios.patch(url, data).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    handleClosed() {
      const url = `/api/v1/tickets/tickets/${this.object.id}/`
      const data = { status: 'closed' }
      this.$axios.patch(url, data).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    handleComment() {
      this.createComment()
    }
  }
}
</script>

<style scoped>
  .feed-activity-list {
    padding-top: 20px;
    line-height: 1.5;
  }
  .feed-activity-list .feed-element {
    border-bottom: 1px solid #e7eaec;
  }
  .feed-element:first-child {
    margin-top: 0;
  }
  .feed-element {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .feed-element,
  .media-body {
    overflow: hidden;
  }
  .feed-element > .pull-left {
    margin-right: 10px;
  }
  .feed-element .header-avatar {
    width: 38px;
    height: 38px;
  }
  .text-muted {
    color: #888888;
  }
</style>
