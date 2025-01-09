<template>
  <div :class="{'no-title': noTitle}" class="page">
    <TagsView />
    <PageHeading v-if="iTitle || helpMessage" :help-msg="helpMessage" class="disabled-when-print page-head">
      <el-button
        v-if="!inDrawer"
        :disabled="gobackDisabled"
        class="go-back"
        icon="el-icon-back"
        @click="handleGoBack"
        @mouseleave="endLongPress"
        @mouseup="endLongPress"
        @mousedown.native="startLongPress"
      />
      <slot name="title">
        <span style="padding-left: 10px">
          {{ iTitle }}
          <el-tooltip v-if="helpTip" :open-delay="500" effect="dark" placement="top" popper-class="help-tips">
            <div slot="content" v-sanitize="helpTip" class="page-help-content" />
            <span>
              <el-button class="help-msg-btn">
                <i class="el-icon-info" />
              </el-button>
            </span>
          </el-tooltip>
        </span>
      </slot>
      <template #rightSide>
        <slot name="headingRightSide" />
      </template>
    </PageHeading>
    <PageContent class="page-content">
      <el-alert v-if="helpMessage" type="success">
        <span v-sanitize="helpMessage" class="announcement-main" />
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
import TagsView from '../TagsView/index.vue'
import { toSentenceCase } from '@/utils/common'
import { mapGetters } from 'vuex'

export default {
  name: 'Page',
  components: {
    UserConfirmDialog,
    PageHeading,
    PageContent,
    TagsView
  },
  props: {
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
    goBack: {
      type: Function,
      default: function(obj) {
        return this.$router.back()
      }
    }
  },
  data() {
    return {
      showHistory: false
    }
  },
  computed: {
    ...mapGetters(['inDrawer']),
    noTitle() {
      return this.title === 'null' || this.title === null
    },
    iTitle() {
      if (this.noTitle) {
        return
      }
      let title = this.title || this.$route.meta.title
      if (!title) {
        title = this.$t('NoTitle')
      }
      title = toSentenceCase(title)
      return title
    },
    gobackDisabled() {
      if (this.$route.path.endsWith('dashboard')) {
        return true
      }
      return window.history.length <= 2
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
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  // 这个不加的话，page title 也会滚动
  height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  overflow-x: hidden;

  .el-alert {
    margin-top: -5px;
    margin-bottom: 5px;
  }

  &.no-title {
  }

  .page-head {

  }

  .page-content {
    flex: 1; /* 占用剩余高度 */
    //height: calc(100% - 50px);
    overflow-x: hidden;
    overflow-y: auto !important;

    ::v-deep > div {
      // 这个当时为什么设置的
      //margin-bottom: 50px;
      // 别设置，用户列页面会被撑开
      //height: 100%;
    }
  }
}

.go-back {
  border: none;
  padding: 6px;
}

.go-back ::v-deep i {
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
</style>
