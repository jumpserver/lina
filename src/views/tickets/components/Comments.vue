<template>
  <div v-loading="loading">
    <IBox class="box">
      <template #header>
        <div class="clearfix ibox-title"><i class="fa fa-comments" /> {{ $t('Message') }}</div>
      </template>
      <template v-if="comments">
        <div v-for="item in comments" :key="item.id" class="feed-activity-list">
          <div class="feed-element">
            <a class="pull-left" href="#">
              <el-avatar :size="30" :src="imageUrl" class="header-avatar" />
            </a>
            <div class="media-body">
              <strong>{{ item.user_display }}</strong>
              <small class="text-muted">{{ toSafeLocalDateStr(item.date_created) }}</small>
              <MarkDown :value="item.body" />
            </div>
          </div>
        </div>
      </template>
      <slot />
      <el-form ref="comments" :model="form" label-width="45px" style="padding-top: 20px">
        <el-form-item v-if="canComment && !isAuditRoute" :label="$tc('Reply')">
          <el-input v-model="form.comments" :autosize="{ minRows: 4 }" type="textarea" />
        </el-form-item>
        <el-form-item style="float: right">
          <template v-if="hasActionPerm && !isAuditRoute">
            <el-button
              :disabled="isDisabled || object.status.value === 'closed'"
              size="small"
              type="primary"
              @click="handleApprove"
            >
              <i class="fa fa-check" /> {{ $t('Accept') }}
            </el-button>
            <el-button
              :disabled="isDisabled || object.status.value === 'closed'"
              size="small"
              type="warning"
              @click="handleReject"
            >
              <i class="fa fa-ban" /> {{ $t('Reject') }}
            </el-button>
          </template>
          <el-button
            v-if="isSelfTicket && !isAuditRoute"
            :disabled="isDisabled || object.status.value === 'closed'"
            size="small"
            type="danger"
            @click="handleClose"
          >
            <i class="fa fa-times" /> {{ $t('CancelTicket') }}
          </el-button>
          <el-button
            v-if="canComment && !isAuditRoute"
            :disabled="object.status.value === 'closed'"
            size="small"
            type="info"
            @click="handleComment"
          >
            <i class="fa fa-pencil" /> {{ $t('Reply') }}
          </el-button>
        </el-form-item>
      </el-form>
    </IBox>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox'
import MarkDown from '@/components/Widgets/MarkDown'
import { useDateTime } from '@/composables/useDateTime'
import { getAssetUrl } from '@/utils/assets'

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
      isDisabled: false,
      comments: '',
      type_api: '',
      imageUrl: getAssetUrl('img/avatar.png'),
      form: {
        comments: ''
      },
      loading: false
    }
  },
  computed: {
    isAuditRoute() {
      return this.$route.name === 'AuditTicketList'
    },
    hasActionPerm() {
      return (
        this.object.process_map
          .filter((item) => item.approval_level === this.object.approval_step.value)[0]
          .assignees.indexOf(this.$store.state.users.profile.id) !== -1
      )
    },
    isSelfTicket() {
      const profile = this.$store.state.users.profile
      return this.object.applicant === `${profile.name}(${profile.username})`
    },
    canComment() {
      const profile = this.$store.state.users.profile
      const isCcUser = (this.object.cc_users || []).some((user) => user.id === profile.id)
      return !isCcUser || this.hasActionPerm || this.isSelfTicket
    }
  },
  setup() {
    return useDateTime()
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
    getComment() {
      this.loading = true
      const url = `/api/v1/tickets/comments/?ticket_id=${this.object.id}`
      this.$axios
        .get(url)
        .then((res) => {
          this.comments = res
        })
        .catch((err) => {
          this.$message.error(err)
        })
        .finally(() => {
          this.loading = false
          this.form.comments = ''
        })
    },
    defaultApprove() {
      this.createComment(function () {})
      const url = `/api/v1/tickets/${this.type_api}/${this.object.id}/approve/`
      return this.$axios.put(url).then((res) => {
        this.reloadPage()
      })
    },
    defaultReject() {
      this.createComment(function () {})
      const url = `/api/v1/tickets/${this.type_api}/${this.object.id}/reject/`
      return this.$axios.put(url).then((res) => {
        this.reloadPage()
      })
    },
    defaultClose() {
      const url = `/api/v1/tickets/${this.type_api}/${this.object.id}/close/`
      return this.$axios.put(url).then((res) => {
        this.reloadPage()
      })
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
      this.$axios.post(commentUrl, body).then((res) => {
        if (successCallback) {
          successCallback()
        } else {
          this.reloadPage()
        }
      })
    },
    async handleAction(actionType) {
      if (this.isDisabled) {
        return
      }

      this.isDisabled = true
      let handler
      switch (actionType) {
        case 'approve':
          handler = this.approve || this.defaultApprove
          break
        case 'reject':
          handler = this.reject || this.defaultReject
          break
        case 'close':
          handler = this.close || this.defaultClose
          break
        default:
          handler = null
          break
      }

      if (handler) {
        try {
          await handler()
        } catch (err) {
          this.$message.error(err)
        } finally {
          this.isDisabled = false
        }
      } else {
        this.$message.error('No handler for action')
        this.isDisabled = false
      }
    },
    handleApprove() {
      this.handleAction('approve')
    },
    handleReject() {
      this.handleAction('reject')
    },
    handleClose() {
      this.handleAction('close')
    },
    handleComment() {
      this.createComment(this.getComment)
    },
    reloadPage() {
      window.location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-bottom: 15px;
}

.feed-activity-list {
  //padding-top: 20px;
  line-height: 1.5;
}

// 底部通过/拒绝/撤销/回复按钮统一到全站 30px 规范(原 size="small" 偏矮),图标与文字留 4px 间距
:deep(.el-form-item .el-button) {
  height: 30px;
  min-height: 30px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;

  .fa {
    margin-right: 4px;
  }

  & + .el-button {
    margin-left: 8px;
  }
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

:deep(.markdown-body) {
  padding: 0;
}

:deep(.markdown-body table) {
  width: 100%;
  margin: 10px 0 0;
  table-layout: fixed;
  border-collapse: collapse;
}

:deep(.markdown-body th),
:deep(.markdown-body td) {
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
  overflow-wrap: anywhere;
  word-break: break-word;
  border: 1px solid var(--el-border-color-lighter);
}

:deep(.markdown-body th) {
  color: var(--el-text-color-regular);
  font-weight: 600;
  background: var(--el-fill-color-lighter);
}

:deep(.markdown-body th:first-child),
:deep(.markdown-body td:first-child) {
  width: 18%;
}
</style>
