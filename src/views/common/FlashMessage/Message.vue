<template>
  <div v-if="message" style="margin-left: 5%">
    <div style="background: #eee; width: 90%; height: 40px; margin-bottom: 5%">
      <p :class="['message', { error: extraMenuConfig.error }]">{{ message }}</p>
    </div>
    <div>
      <el-button
        v-if="extraMenuConfig.has_cancel"
        size="small"
        @click="handleCancel"
      >
        {{ $t('common.Cancel') }}
      </el-button>
      <el-button
        size="small"
        type="primary"
        @click="handleConfirm"
      >
        {{ confirmButtonMsg }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    extraMenuConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      message: '',
      timer: ''
    }
  },
  computed: {
    confirmButtonMsg() {
      return this.extraMenuConfig.confirm_button || this.$t('common.Confirm')
    }
  },
  created() {
    this.setIntervalMsgTimer()
  },
  mounted() {
  },
  methods: {
    setIntervalMsg(interval) {
      const baseMessage = this.extraMenuConfig.message || this.extraMenuConfig.error
      if (baseMessage) {
        this.message = `${baseMessage}, ${interval} ...`
      }
    },
    setIntervalMsgTimer() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      let interval = this.extraMenuConfig.interval || 3
      this.setIntervalMsg(interval)
      this.timer = setInterval(() => {
        interval = interval - 1
        this.setIntervalMsg(interval)
        if (interval <= 0) {
          clearInterval(this.timer)
          this.handleConfirm()
        }
      }, 1000)
    },
    handleCancel() {
      window.location = this.extraMenuConfig.cancel_url
      clearInterval(this.timer)
    },
    handleConfirm() {
      window.location = this.extraMenuConfig.redirect_url
    }
  }
}
</script>

<style scoped>
  .message {
    line-height: 40px; padding-left: 10px
  }
  .error {
    color: red;
  }
</style>
