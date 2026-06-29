<template>
  <div :class="{ 'no-title': noTitle }" class="page">
    <PageHeading v-if="showHeading" :help-msg="helpMessage" class="disabled-when-print page-head">
      <el-button
        :disabled="gobackDisabled"
        class="go-back"
        icon="Back"
        @click="handleGoBack"
        @mouseleave="endLongPress"
        @mouseup="endLongPress"
        @mousedown="startLongPress"
      />
      <slot name="title">
        <span class="page-title-wrap">
          {{ iTitle }}
          <el-tooltip
            v-if="helpTip"
            :open-delay="500"
            effect="dark"
            placement="top"
            popper-class="help-tips"
          >
            <template #content>
              <div v-sanitize="helpTip" class="page-help-content" />
            </template>
            <span>
              <el-button class="help-msg-btn">
                <el-icon><InfoFilled /></el-icon>
              </el-button>
            </span>
          </el-tooltip>
        </span>
      </slot>
      <template #rightSide>
        <slot name="headingRightSide" />
      </template>
    </PageHeading>
    <PageContent :class="{ disabled: disabled }" class="page-content">
      <div v-if="disabled" class="content-disabled-mask">
        <IBox shadow="always">
          <div class="disabled-content">
            <div class="lock-icon">
              <el-icon><Unlock /></el-icon>
            </div>
            <div class="disabled-text">
              {{ $t('UpgradeEnterpriseEditionHelpText') }}
            </div>
            <el-button class="upgrade-btn" type="primary" @click="handleUpgrade">
              {{ $t('UpgradeEnterpriseEdition') }}
            </el-button>
          </div>
        </IBox>
      </div>
      <el-alert
        v-if="iHelpMessage && helpAlertVisible"
        class="page-alert"
        :closable="true"
        :type="helpAlertType"
        @close="helpAlertVisible = false"
      >
        <span v-sanitize="iHelpMessage" class="announcement-main" />
      </el-alert>
      <slot />
    </PageContent>
    <UserConfirmDialog />
  </div>
</template>

<script>
import PageHeading from './PageHeading'
import PageContent from './PageContent'
import UserConfirmDialog from '@/components/Apps/UserConfirmDialog/index.vue'
import { toSentenceCase } from '@/utils/common/index'
import IBox from '@/components/Common/IBox/index.vue'
import i18n from '@/i18n/i18n'

export default {
  name: 'Page',
  components: {
    UserConfirmDialog,
    PageHeading,
    PageContent,
    IBox
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    helpMessage: {
      type: String,
      default: ''
    },
    helpTip: {
      type: String,
      default: ''
    },
    helpAlertType: {
      type: String,
      default: 'info'
    },
    hideHeading: {
      type: Boolean,
      default: false
    },
    goBack: {
      type: Function,
      default: function (obj) {
        if (window.history.length > 1) {
          window.history.back()
        }
      }
    }
  },
  data() {
    return {
      showHistory: false,
      helpAlertVisible: true
    }
  },
  computed: {
    noTitle() {
      return this.title === 'null' || this.title === null
    },
    showHeading() {
      return !this.hideHeading && (this.iTitle || this.iHelpMessage)
    },
    iTitle() {
      if (this.noTitle) {
        return
      }
      let title = this.title || this.$route.meta.title
      if (!title) {
        title = i18n.global.t('NoTitle')
      }
      title = toSentenceCase(title)
      return title
    },
    gobackDisabled() {
      if (this.$route.path.endsWith('dashboard')) {
        return true
      }
      return window.history.length <= 2
    },
    iHelpMessage() {
      return this.helpMessage || this.helpTip
    }
  },
  watch: {
    iHelpMessage() {
      this.helpAlertVisible = true
    }
  },
  methods: {
    handleGoBack() {
      this.goBack.bind(this)()
    },
    startLongPress() {
      this.longPressTimer = setTimeout(() => {
        this.showHistory = !this.showHistory
        localStorage.setItem('showHistory', this.showHistory ? '1' : '0')
        // 在这里执行长按事件的操作
      }, 1000) // 设置长按持续时间，单位为毫秒
    },
    endLongPress() {
      clearTimeout(this.longPressTimer)
    },
    handleUpgrade() {
      const url = 'https://www.lxware.hk/pages/about'
      window.open(url, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.page {
  // 这个不加的话，page title 也会滚动
  // 高度需与固定头部 $headerHeight（40px）一致，否则底部内容滚不到 / 顶部留白
  height: calc(100vh - #{$headerHeight});
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  overflow-x: hidden;

  .el-alert {
    margin: 0 !important;
  }

  .page-content {
    flex: 1; /* 占用剩余高度 */
    min-height: 0; /* flex 子项默认 min-height:auto 不会收缩，导致内部滚动底部被裁剪 */
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto !important;

    :deep(> div) {
      // 这个当时为什么设置的
      //margin-bottom: 50px;
      // 别设置，用户列页面会被撑开
      //height: 100%;
    }
  }
}

.page.drawer {
  height: auto;
  min-height: 100%;
  overflow: visible;

  .page-content {
    overflow: visible !important;
  }
}

.page-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-left: 10px;
}

.go-back {
  border: none;
  padding: 6px;
}

.go-back :deep(i) {
  font-size: 18px;
  font-weight: 600;
}

@media print {
  .disabled-when-print {
    display: none;
  }

  .enabled-when-print {
    display: inherit !important;
  }

  .print-margin {
    margin-top: 10px;
  }

  .announcement-main {
    word-wrap: break-word;
    white-space: pre-wrap;
  }
}

.ibox {
  width: 500px;
  position: absolute;
  top: 30%;
}

.content-disabled-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .disabled-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .lock-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px auto;

      i {
        font-size: 40px;
        color: #909399;
      }
    }

    .disabled-text {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
      padding: 10px;
    }

    .upgrade-btn {
      min-width: 120px;
      margin: 10px auto;
    }
  }
}

.page-content.disabled {
  position: relative;
}
</style>
