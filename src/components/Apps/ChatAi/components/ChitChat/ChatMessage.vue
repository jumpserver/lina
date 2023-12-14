<template>
  <div :class="{'user-role': isUserRole}" class="chat-item">
    <div class="avatar">
      <el-avatar :src="isUserRole ? userUrl : chatUrl" class="header-avatar" />
    </div>
    <div class="content">
      <div class="operational">
        <span class="date">
          {{ $moment(item.message.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </span>
      </div>
      <div class="message">
        <div class="message-content">
          <span v-if="isSystemError" class="error">
            {{ item.message.content }}
          </span>
          <span v-else class="chat-text">
            <MessageText :message="item.message" />
          </span>
        </div>
        <div class="action">
          <el-tooltip
            v-if="isSystemError && isLoading"
            :content="$tc('common.Reconnect')"
            effect="dark"
            placement="top"
          >
            <svg-icon icon-class="refresh" @click="onRefresh" />
          </el-tooltip>
          <el-dropdown v-else size="small" @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="fa fa-ellipsis-v" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="i in dropdownOptions" :key="i.action" :command="i.action">
                {{ i.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MessageText from './MessageText.vue'
import { mapState } from 'vuex'
import { copy } from '@/utils/common'
import { useChat } from '../../useChat.js'
import { reconnect } from '@/utils/socket'

const { setLoading, removeLoadingMessageInChat } = useChat()

export default {
  components: {
    MessageText
  },
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      chatUrl: require('@/assets/img/chat.png'),
      userUrl: '/api/v1/settings/logo/',
      dropdownOptions: [
        {
          action: 'copy',
          label: this.$t('common.Copy')
        }
      ]
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.chat.loading
    }),
    isUserRole() {
      return this.item.message?.role === 'user'
    },
    isSystemError() {
      return this.item.type === 'error' && this.item.message?.role === 'assistant'
    }
  },
  methods: {
    onRefresh() {
      reconnect()
      removeLoadingMessageInChat()
      setLoading(false)
    },
    handleCommand(value) {
      if (value === 'copy') {
        copy(this.item.message.content)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-item {
  display: flex;
  padding: 16px 14px 0;
  &:last-child {
    padding-bottom: 16px;
  }
  .avatar {
    width: 22px;
    height: 22px;
    margin-top: 2px;
    .header-avatar {
      width: 100%;
      height: 100%;
      &>>> img {
        background-color: #e5e5e7;
      }
    }
  }
  .content {
    margin-left: 6px;
    overflow: hidden;
    .operational {
      display: flex;
      justify-content: space-between;
      overflow: hidden;
      .copy {
        float: right;
        cursor: pointer;
      }
    }
    .message {
      display: -webkit-box;
      .message-content {
        flex: 1;
        padding: 6px 10px;
        border-radius: 2px 12px 12px;
        background-color: #f0f1f5;
      }
      .action {
        .svg-icon {
          transform: translateY(50%);
          margin-left: 3px;
          cursor: pointer;
        }
        .el-dropdown {
          height: 32px;
          line-height: 37px;
          font-size: 13px;
          .el-dropdown-link {
            i {
              padding: 4px 5px;
              font-size: 15px;
              color: #8d9091;
              &:hover {
                color: #7b8085
              }
            }
          }
        }
      }
      .error {
        color: red;
      }
    }
  }
}
.user-role {
  flex-direction: row-reverse;
  .content {
    margin-right: 10px;
    .operational {
      flex-direction: row-reverse;
    }
    .message {
      flex-direction: row-reverse;
      .message-content {
        background-color: var(--menu-hover);
        border-radius: 12px 2px 12px 12px;
      }
    }
  }
}
</style>
