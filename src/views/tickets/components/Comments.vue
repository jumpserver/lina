<template>
  <IBox v-loading="loading" class="box">
    <div slot="header" class="clearfix ibox-title">
      <i class="fa fa-comments" /> {{ $t('common.Message') }}
    </div>
    <template v-if="comments">
      <div v-for="item in comments" :key="item.id" class="feed-activity-list">
        <div class="feed-element">
          <a href="#" class="pull-left">
            <el-avatar :src="imageUrl" class="header-avatar" />
          </a>
          <div class="media-body ">
            <strong>{{ item.user_display }}</strong> <small class="text-muted">{{ formatTime(item.date_created) }}</small>
            <br>
            <small class="text-muted">{{ toSafeLocalDateStr(item.date_created) }}</small>
            <pre style="padding-top: 10px; overflow: auto">
              {{ item.body }}
            </pre>
          </div>
        </div>
      </div>
    </template>
    <slot />
    <el-form ref="comments" :model="form" label-width="45px" style="padding-top: 20px">
      <el-form-item :label="$t('tickets.reply')">
        <el-input v-model="form.comments" :autosize="{ minRows: 4 }" type="textarea" />
      </el-form-item>
      <el-form-item style="float: right">
        <template v-if="hasActionPerm">
          <el-button
            :disabled="object.status === 'closed'"
            type="primary"
            size="small"
            @click="handleApprove"
          >
            <i class="fa fa-check" /> {{ $t('tickets.Accept') }}
          </el-button>
          <el-button
            :disabled="object.status === 'closed'"
            type="warning"
            size="small"
            @click="handleReject"
          >
            <i class="fa fa-ban" /> {{ $t('tickets.Reject') }}
          </el-button>
        </template>
        <el-button
          v-if="isSelfTicket"
          :disabled="object.status === 'closed'"
          type="danger"
          size="small"
          @click="handleClose"
        >
          <i class="fa fa-times" /> {{ $t('tickets.Close') }}
        </el-button>
        <el-button
          :disabled="object.status === 'closed'"
          type="info"
          size="small"
          @click="handleComment"
        >
          <i class="fa fa-pencil" /> {{ $t('tickets.reply') }}
        </el-button>
      </el-form-item>
    </el-form>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
import { formatTime, getDateTimeStamp } from '@/utils'
import { toSafeLocalDateStr } from '@/utils/common'
export default {
  name: 'Comments',
  components: { IBox },
  props: {
    object: {
      type: Object,
      default: () => ({})
    },
    approve: {
      type: Function,
      default: null
    },
    reject: {
      type: Function,
      default: null
    },
    close: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      comments: '',
      imageUrl: require('@/assets/img/admin.png'),
      form: {
        comments: ''
      },
      loading: false
    }
  },
  computed: {
    hasActionPerm() {
      return this.object.process_map[this.object.approval_step - 1].assignees.indexOf(this.$store.state.users.profile.id) !== -1
    },
    isSelfTicket() {
      return this.object.applicant === this.$store.state.users.profile.id
    }
  },
  mounted() {
    this.getComment()
  },
  methods: {
    formatTime(dateStr) {
      return formatTime(getDateTimeStamp(dateStr))
    },
    toSafeLocalDateStr(dataStr) {
      return toSafeLocalDateStr(dataStr)
    },
    getComment() {
      this.loading = true
      const url = `/api/v1/tickets/comments/?ticket_id=${this.object.id}`
      this.$axios.get(url).then(res => {
        this.comments = res
      }).catch(err => {
        this.$message.error(err)
      }).finally(() => {
        this.loading = false
        this.form.comments = ''
      })
    },
    defaultApprove() {
      this.createComment(function() {
      })
      const url = `/api/v1/tickets/tickets/${this.object.id}/approve/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    defaultReject() {
      this.createComment(function() {})
      const url = `/api/v1/tickets/tickets/${this.object.id}/reject/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    defaultClose() {
      const url = `/api/v1/tickets/tickets/${this.object.id}/close/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    createComment(successCallback) {
      const commentText = this.form.comments
      const ticketId = this.object.id
      const commentUrl = `/api/v1/tickets/comments/?ticket_id=${this.object.id}`
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
      const handler = this.approve || this.defaultApprove
      handler()
    },
    handleReject() {
      const handler = this.reject || this.defaultReject
      handler()
    },
    handleClose() {
      const handler = this.close || this.defaultClose
      handler()
    },
    handleComment() {
      this.createComment(
        this.getComment
      )
    },
    reloadPage() {
      window.location.reload()
    }
  }

}
</script>

<style lang='less' scoped>
.box {
  margin-bottom: 15px;
}
.feed-activity-list {
  //padding-top: 20px;
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
