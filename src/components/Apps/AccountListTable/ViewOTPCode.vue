<template>
  <Dialog
    :destroy-on-close="true"
    :show-cancel="false"
    :title="$tc('OTPCode')"
    :visible.sync="showDialog"
    :width="'40'"
    v-bind="$attrs"
    @confirm="showDialog = false"
    v-on="$listeners"
  >
    <el-form label-position="right" label-width="130px">
      <el-form-item :label="$tc('Name')">
        <span>{{ account.name || '-' }}</span>
      </el-form-item>
      <el-form-item :label="$tc('Username')">
        <span>{{ account.username || '-' }}</span>
      </el-form-item>
      <el-form-item :label="$tc('CurrentOTPCode')">
        <div class="otp-panel">
          <div class="otp-panel__header">
            <span class="otp-panel__title">{{ account.asset?.name || '-' }}</span>
          </div>
          <div class="otp-panel__code" @click="copyCurrentOTPCode">{{ currentOTPCode || '------' }}</div>
          <div class="otp-panel__footer">
            <span class="otp-panel__footer-text">{{ account.username || '-' }}</span>
            <span class="otp-panel__countdown">{{ secondsRemaining }}s</span>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { copy } from '@/utils/common/index'
import { mapGetters } from 'vuex'

const OTP_PERIOD = 30

export default {
  name: 'ViewOTPCode',
  components: {
    Dialog
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showDialog: false,
      currentOTPCode: '',
      loading: false,
      secondsRemaining: OTP_PERIOD,
      countdownTimer: null
    }
  },
  computed: {
    ...mapGetters({
      publicSettings: 'publicSettings'
    })
  },
  mounted() {
    this.showDialog = this.visible
    if (!this.publicSettings.SECURITY_ACCOUNT_SECRET_READ) {
      this.$message.warning(this.$tc('AccountSecretReadDisabled'))
      this.$emit('update:visible', false)
      return
    }
    this.syncCountdown()
    this.startCountdown()
    this.loadCurrentOTPCode({ disableFlashErrorMsg: true })
  },
  beforeDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
  },
  methods: {
    syncCountdown() {
      const timestamp = Math.floor(Date.now() / 1000)
      const mod = timestamp % OTP_PERIOD
      this.secondsRemaining = mod === 0 ? OTP_PERIOD : OTP_PERIOD - mod
    },
    startCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
      }
      this.countdownTimer = setInterval(() => {
        const previous = this.secondsRemaining
        this.syncCountdown()
        if (this.secondsRemaining === OTP_PERIOD && previous !== OTP_PERIOD) {
          this.loadCurrentOTPCode({ disableFlashErrorMsg: true })
        }
      }, 1000)
    },
    loadCurrentOTPCode(options = {}) {
      this.loading = true
      return this.$axios
        // eslint-disable-next-line spellcheck/spell-checker
        .get(`/api/v1/accounts/account-secrets/${this.account.id}/otp-code/`, options)
        .then(res => {
          this.currentOTPCode = res?.otp_code || ''
          this.syncCountdown()
        })
        .finally(() => {
          this.loading = false
        })
    },
    copyCurrentOTPCode() {
      if (!this.currentOTPCode) return
      copy(this.currentOTPCode)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form-item {
  border-bottom: 1px solid #ebeef5;
  padding: 5px 0;
  margin-bottom: 0;

  &:last-child {
    border-bottom: none;
  }

  ::v-deep .el-form-item__label {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-right: 20px;
    line-height: 30px;
    word-break: keep-all;
    overflow-wrap: break-word;
    white-space: normal;
  }

  ::v-deep .el-form-item__content {
    line-height: 30px;
  }
}

.otp-panel {
  border: 1px solid #dfe4ec;
  border-radius: 4px;
  background: #f5f7fa;
  padding: 12px 16px;
}

.otp-panel__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.otp-panel__title {
  color: #606266;
  font-size: 13px;
  line-height: 1.2;
  word-break: break-all;
}

.otp-panel__code {
  margin: 10px 0 6px;
  color: var(--color-info);
  font-size: 42px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 2px;
  font-family: Monaco, Menlo, Consolas, monospace;
  cursor: pointer;
  user-select: none;
}

.otp-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #909399;
  font-size: 12px;
  line-height: 1.2;
}

.otp-panel__footer-text {
  word-break: break-all;
}

.otp-panel__countdown {
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
}
</style>
