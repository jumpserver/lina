<template>
  <IBox v-loading="loading" class="box">
    <div slot="header" class="clearfix ibox-title">
      <i class="fa fa-comments" /> {{ $t('common.Message') }}
    </div>
    <template v-if="comments">
      <div v-for="item in comments" :key="item.id" class="feed-activity-list">
        <div class="feed-element">
          <a class="pull-left" href="#">
            <el-avatar :size="30" :src="imageUrl" class="header-avatar" />
          </a>
          <div class="media-body ">
            <strong>{{ item.user_display }}</strong>
            <small class="text-muted">{{ formatTime(item.date_created) }}</small>
            <br>
            <small class="text-muted">{{ item.date_created | date }}</small>
            <MarkDown :value="item.body" />
          </div>
        </div>
      </div>
    </template>
    <slot />
    <el-form ref="comments" :model="form" label-width="45px" style="padding-top: 20px">
      <el-form-item :label="$tc('tickets.reply')">
        <el-input v-model="form.comments" :autosize="{ minRows: 4 }" type="textarea" />
      </el-form-item>
      <el-form-item style="float: right">
        <template v-if="hasActionPerm">
          <el-button
            :disabled="object.status.value === 'closed'"
            size="small"
            type="primary"
            @click="handleApprove"
          >
            <i class="fa fa-check" /> {{ $t('tickets.Accept') }}
          </el-button>
          <el-button
            :disabled="object.status.value === 'closed'"
            size="small"
            type="warning"
            @click="handleReject"
          >
            <i class="fa fa-ban" /> {{ $t('tickets.Reject') }}
          </el-button>
        </template>
        <el-button
          v-if="isSelfTicket"
          :disabled="object.status.value === 'closed'"
          size="small"
          type="danger"
          @click="handleClose"
        >
          <i class="fa fa-times" /> {{ $t('tickets.Close') }}
        </el-button>
        <el-button
          :disabled="object.status.value === 'closed'"
          size="small"
          type="info"
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
import MarkDown from '@/components/Widgets/MarkDown'

export default {
  name: 'Comments',
  components: { IBox, MarkDown },
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
      type_api: '',
      imageUrl: require('@/assets/img/avatar.png'),
      form: {
        comments: ''
      },
      loading: false
    }
  },
  computed: {
    hasActionPerm() {
      return this.object.process_map.filter(
        item => item.approval_level === this.object.approval_step.value
      )[0].assignees.indexOf(this.$store.state.users.profile.id) !== -1
    },
    isSelfTicket() {
      const profile = this.$store.state.users.profile
      return this.object.applicant === `${profile.name}(${profile.username})`
    }
  },
  mounted() {
    switch (this.object.type.value) {
      case 'login_confirm':
        this.type_api = 'apply-login-tickets'
        break
      case 'apply_asset':
        this.type_api = 'apply-asset-tickets'
        break
      case 'login_asset_confirm':
        this.type_api = 'apply-login-asset-tickets'
        break
      case 'command_confirm':
        this.type_api = 'apply-command-tickets'
        break
      default:
        this.type_api = 'tickets'
    }
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
      const url = `/api/v1/tickets/${this.type_api}/${this.object.id}/approve/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    defaultReject() {
      this.createComment(function() {
      })
      const url = `/api/v1/tickets/${this.type_api}/${this.object.id}/reject/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    defaultClose() {
      const url = `/api/v1/tickets/${this.type_api}/${this.object.id}/close/`
      this.$axios.put(url).then(res => this.reloadPage()).catch(err => this.$message.error(err))
    },
    createComment(successCallback) {
      const commentText = this.form.comments
      const ticketId = this.object.id
      const commentUrl = `/api/v1/tickets/comments/?ticket_id=${this.object.id}`
      if (!commentText) {
        return
      }
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
