<template>
  <div :class="{ 'user-role': isUserRole }" class="chat-item">
    <div class="chart-item-container">
      <div class="avatar">
        <el-avatar v-if="isUserRole" :src="userUrl" class="header-avatar" />
        <el-avatar v-else class="header-avatar" :style="{ backgroundColor: 'transparent' }">
          <ModelIcon :name="modelIconName" class-name="model-icon" />
        </el-avatar>
      </div>
      <div class="content">
        <div class="operational">
          <div v-if="!hasReasoning" class="date">
            {{ $moment(item.message.create_time).format('YYYY-MM-DD HH:mm:ss') }}
          </div>

          <div v-else :class="{ 'is-thinking': isThinking }" class="thinking-time">
            <span v-if="isThinking" class="thinking-dot" />
            {{ $t(isThinking ? 'ChatAIThinking' : 'DeeplyThoughtAbout') }}
          </div>
        </div>
        <div :class="item.reasoning ? 'reasoning' : 'message'">
          <div class="message-content">
            <div v-if="!item.reasoning">
              <span v-if="isSystemError" class="error">
                {{ item.message.content }}
              </span>
              <span v-else class="chat-text">
                <MessageText
                  :is-terminal="isTerminal"
                  :message="item.message"
                  @insert-code="handleInsertCode"
                />
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
                <MessageText
                  :message="item.result"
                  :is-terminal="isTerminal"
                  @insert-code="handleInsertCode"
                />
              </div>
            </div>
          </div>
          <div class="action">
            <el-tooltip
              v-if="isSystemError && isLoading"
              :content="$tc('Reconnect')"
              :show-after="500"
              placement="top"
            >
              <svg-icon icon-class="refresh" @click="onRefresh" />
            </el-tooltip>
            <el-dropdown
              v-else
              popper-class="chat-message-dropdown"
              size="small"
              @command="handleCommand"
            >
              <span class="el-dropdown-link chat-message-dropdown-trigger">
                <i class="fa fa-ellipsis-v" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="i in dropdownOptions"
                    :key="i.action"
                    :command="i.action"
                  >
                    {{ i.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
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
      default: () => ({})
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
      isLoading: (state) => state.chat.loading
    }),
    ...mapGetters(['publicSettings']),
    isUserRole() {
      return this.item.message?.role === 'user'
    },
    isSystemError() {
      return this.item.type === 'error' && this.item?.message?.role === 'assistant'
    },
    hasReasoning() {
      return Boolean(this.item.reasoning)
    },
    isThinking() {
      return this.hasReasoning && this.item.status === 'thinking'
    },
    messageContent() {
      return this.item.result?.content ?? this.item.message?.content ?? ''
    },
    isServerError() {
      return this.item.type === 'finish' && this.messageContent === ''
        ? this.$t('ServerBusyRetry')
        : ''
    },
    modelIconName() {
      return (
        this.item?.message?.model ||
        this.selectedModel ||
        this.publicSettings.CHAT_AI_TYPE ||
        ''
      ).toString()
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
        copy(this.messageContent)
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
    width: 100%;
    min-width: 0;
    max-width: 100%;
    gap: 0.5rem;

    .avatar {
      flex: 0 0 24px;
      width: 24px;
      height: 24px;
      margin-top: 2px;

      .header-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: transparent;

        &:deep(img) {
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
      flex: 1;
      width: 0;
      min-width: 0;
      max-width: 100%;
      flex-direction: column;

      .operational {
        display: flex;
        justify-content: space-between;
        overflow: hidden;

        .date {
          padding-top: 5px;
        }

        .thinking-time {
          display: inline-flex;
          width: fit-content;
          min-height: 28px;
          align-items: center;
          gap: 6px;
          box-sizing: border-box;
          padding: 4px 10px;
          border: 1px solid transparent;
          border-radius: 14px;
          color: rgba(0, 0, 0, 0.45);
          background-color: #f7f7f8;

          &.is-thinking {
            color: #148f76;
            background-color: rgb(26 179 148 / 8%);
          }

          .thinking-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #1ab394;
            animation: thinking-pulse 1.2s ease-in-out infinite;
          }
        }

        .copy {
          float: right;
          cursor: pointer;
        }
      }

      .reasoning {
        display: flex;
        min-width: 0;
        max-width: 100%;
        gap: 0.5rem;
        align-items: flex-end;

        .message-content {
          min-width: 0;
          max-width: calc(100% - 24px);
        }

        .message-content .thinking-wrapper {
          display: flex;
          min-width: 0;
          max-width: 100%;
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

              :deep(p) {
                color: #8b8b8b;
              }
            }
          }
        }
      }

      .message {
        display: flex;
        min-width: 0;
        max-width: 100%;
        align-items: flex-end;

        .message-content {
          flex: 1;
          min-width: 0;
          max-width: calc(100% - 24px);
          overflow: hidden;
          padding: 6px 10px;
          border-radius: 2px 12px 12px;
          background-color: #f0f1f5;
        }

        .action {
          flex: 0 0 24px;

          .svg-icon {
            transform: translateY(50%);
            margin-left: 3px;
            cursor: pointer;
          }

          .el-dropdown {
            display: inline-flex;
            align-items: center;
            height: 32px;
            font-size: 13px;

            .chat-message-dropdown-trigger {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              border-radius: 4px;
              cursor: pointer;
              outline: none;

              &:focus,
              &:focus-visible {
                outline: none;
              }

              i {
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

      .chat-text {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
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

@keyframes thinking-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.85);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

<style lang="scss">
.chat-message-dropdown.el-dropdown__popper .el-dropdown-menu--small {
  padding: 6px 0;
}

.chat-message-dropdown.el-dropdown__popper .el-dropdown-menu__item {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 20px;
  font-size: 13px;
  line-height: 34px;
}
</style>
