<template>
  <div class="page">
    <PageHeading v-if="iTitle || helpMessage" class="disabled-when-print">
      <el-button :disabled="gobackDisabled" class="go-back" icon="el-icon-back" @click="handleGoBack" />
      <slot name="title">
        <span style="padding-left: 10px">{{ iTitle }}</span>
      </slot>
      <template #rightSide>
        <slot name="headingRightSide" />
      </template>
    </PageHeading>
    <PageContent>
      <el-alert v-if="helpMessage" type="success">
        <span class="announcement-main" v-html="helpMessage" />
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

export default {
  name: 'Page',
  components: {
    UserConfirmDialog,
    PageHeading,
    PageContent
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
    goBack: {
      type: Function,
      default: function(obj) {
        return this.$router.back()
      }
    }
  },
  computed: {
    iTitle() {
      return this.title || this.$route.meta.title
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
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  height: calc(100vh - 50px);
  overflow-y: auto;
  overflow-x: hidden;

  .el-alert {
    margin-top: -10px;
    margin-bottom: 10px;
  }
}

.go-back {
  border: none;
  padding: 2px 2px;
}

.go-back >>> i {
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
