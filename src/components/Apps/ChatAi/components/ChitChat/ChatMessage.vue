<template>
  <div :class="{ 'user-role': isUserRole }" class="chat-item">
    <div class="chart-item-container">
      <div class="avatar">
        <el-avatar
          v-if="isUserRole"
          :src="userUrl"
          class="header-avatar"
        />
        <el-avatar
          v-else-if="!hasModelIcon"
          :src="chatUrl"
          class="header-avatar"
        />
        <el-avatar v-else class="header-avatar">
          <ModelIcon :name="modelIconName" class-name="model-icon" />
        </el-avatar>
      </div>
      <div class="content">
        <div class="operational">
          <div v-if="!item.message.is_reasoning" class="date">
            {{
              $moment(item.message.create_time).format("YYYY-MM-DD HH:mm:ss")
            }}
          </div>

          <div v-else class="thinking-time">{{ $i18n.t('DeeplyThoughtAbout') }}</div>
        </div>
        <div :class="item.reasoning ? 'reasoning' : 'message'">
          <div class="message-content">
            <div v-if="!item.reasoning">
              <span v-if="isSystemError" class="error">
                {{ item.message.content }}
              </span>
              <span v-else class="chat-text">
                <MessageText :message="item.message" />
              </span>
            </div>

            <div v-else class="thinking-wrapper">
              <div class="thinking-content">
                <!-- eslint-disable-next-line -->
                <div class="divider"></div>
                <p>
                  <MessageText :message="item.reasoning" @insert-code="handleInsertCode" />
                </p>
              </div>

              <div class="thinking-result">
                <span v-if="isServerError" class="error">
                  {{ isServerError }}
                </span>
                <MessageText :message="item.result" :is-terminal="isTerminal" @insert-code="handleInsertCode" /></div>
            </div>
          </div>
          <div class="action">
            <el-tooltip
              v-if="isSystemError && isLoading"
              :content="$tc('Reconnect')"
              :open-delay="500"
              placement="top"
            >
              <svg-icon icon-class="refresh" @click="onRefresh" />
            </el-tooltip>
            <el-dropdown v-else size="small" @command="handleCommand">
              <span class="el-dropdown-link">
                <i class="fa fa-ellipsis-v" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="i in dropdownOptions"
                  :key="i.action"
                  :command="i.action"
                >
                  {{ i.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MessageText from './MessageText.vue'
import ModelIcon from '../../models/ModelIcon.vue'
import { mapGetters, mapState } from 'vuex'
import { copy } from '@/utils/common/index'
import { useChat } from '../../useChat.js'
import { reconnect } from '@/utils/request'

const { setLoading, removeLoadingMessageInChat } = useChat()

export default {
  components: {
    MessageText,
    ModelIcon
  },
  props: {
    item: {
      type: Object,
      default: () => {
      }
    },
    selectedModel: {
      type: String,
      default: ''
    },
    isTerminal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userUrl: '/api/v1/settings/logo/',
      dropdownOptions: [
        {
          action: 'copy',
          label: this.$t('Copy')
        }
      ]
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.chat.loading
    }),
    ...mapGetters([
      'publicSettings'
    ]),
    isUserRole() {
      return this.item.message?.role === 'user'
    },
    isSystemError() {
      return (
        this.item.type === 'error' && this.item?.role === 'assistant'
      )
    },
    isServerError() {
      return (this.item.type === 'finish' && this.item.result.content === '')
        ? this.$i18n.t('ServerBusyRetry')
        : ''
    },
    modelIconName() {
      return (this.item?.message?.model || this.selectedModel || this.publicSettings.CHAT_AI_TYPE || '').toString()
    },
    hasModelIcon() {
      const name = this.modelIconName.toLowerCase()
      console.log('-------------- modelIconName --------------', name)
      if (!name) return false
      return ['gpt', 'deep-seek', 'grok', 'claude', 'gemini'].some(key => name.includes(key))
    },
    chatUrl() {
      return this.publicSettings.CHAT_AI_TYPE === 'gpt'
        ? require('@/assets/img/chat.png')
        : require('@/assets/img/deepSeek.png')
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
        copy(this.item.result.content)
      }
    },
    handleInsertCode(code) {
      this.$emit('insert-code', code)
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-item {
  display: flex;
  padding: 0.5rem;

  .chart-item-container {
    display: flex;
    gap: 0.5rem;

    .avatar {
      width: 24px;
      height: 24px;
      margin-top: 2px;

      .header-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;

        &::v-deep img {
          background-color: #fff;
        }
      }

      .model-icon {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      // gap: 0.5rem;
      overflow: hidden;

      .operational {
        display: flex;
        justify-content: space-between;
        overflow: hidden;

        .date {
          padding-top: 5px;
        }

        .thinking-time {
          width: 6rem;
          display: flex;
          justify-content: center;
          padding: 5px 10px;
          border-radius: 0.5rem;
          background-color: #f5f5f5;
        }

        .copy {
          float: right;
          cursor: pointer;
        }
      }

      .reasoning {
        display: flex;
        gap: 0.5rem;
        align-items: flex-end;

        .message-content .thinking-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .thinking-content {
            position: relative;
            color: #8b8b8b;

            .divider {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              border-left: 2px solid #e5e5e5;
            }

            p {
              margin: unset;
              padding-left: 0.5rem;

              ::v-deep p {
                color: #8b8b8b;
              }
            }
          }
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
                  color: #7b8085;
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

  &:last-child {
    padding-bottom: 16px;
  }

  &.user-role {
    flex-direction: row-reverse;

    .chart-item-container {
      flex-direction: row-reverse;
    }

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
}
</style>
