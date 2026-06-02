<template>
  <div>
    <TwoCol>
      <template>
        <!-- 1. Status -->
        <IBox :title="$t('CertDeviceDriverStatus')">
          <table class="status-table">
            <tbody>
              <tr v-for="item in statusItems" :key="item.key">
                <td class="status-label">{{ item.label }}</td>
                <td class="status-value">
                  <el-tag v-if="item.tag !== undefined" :type="item.tag" size="mini" effect="plain">
                    {{ item.value }}
                  </el-tag>
                  <span v-else class="status-text">{{ item.value || '--' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </IBox>

        <!-- 2. Actions -->
        <IBox :title="$t('CertActions')" style="margin-top: 10px">
          <table class="action-table">
            <tbody>
              <tr v-for="action in certActions" :key="action.key">
                <td class="action-desc">
                  <div class="action-title">{{ action.title }}</div>
                  <div class="action-hint">{{ action.hint }}</div>
                </td>
                <td class="action-btn">
                  <el-button
                    :disabled="action.disabled || running"
                    :icon="action.icon"
                    :loading="running && currentAction === action.key"
                    :type="action.btnType || 'primary'"
                    size="small"
                    @click="handleAction(action)"
                  >
                    {{ action.btnLabel }}
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </IBox>

        <!-- 3. Operation Logs -->
        <IBox v-if="logs.length > 0" :title="$t('CertOperationLogs')" style="margin-top: 10px">
          <div class="cert-logs">
            <div ref="logBox" class="logs-box">
              <div
                v-for="(log, i) in logs"
                :key="i"
                :class="['log-item', `log-${log.level}`]"
              >
                <span class="log-time">{{ log.time }}</span>
                <span class="log-msg">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </IBox>
      </template>

      <template #right>
        <!-- Certificate Info -->
        <IBox :title="$t('CertInfo')">
          <table v-if="certInfo" class="status-table">
            <tbody>
              <tr v-for="item in certInfoItems" :key="item.key">
                <td class="status-label">{{ item.label }}</td>
                <td class="status-value">
                  <el-tag v-if="item.tag !== undefined" :type="item.tag" size="mini" effect="plain">
                    {{ item.value }}
                  </el-tag>
                  <span v-else class="status-text">{{ item.value !== undefined ? item.value : '--' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <el-empty v-else :description="$t('CertNoCertIssued')" :image-size="80" />
        </IBox>
      </template>
    </TwoCol>

    <!-- PIN change dialog -->
    <el-dialog
      :title="$t('CertChangePIN')"
      :visible.sync="pinDialog.visible"
      :before-close="cancelPinChange"
      :close-on-click-modal="!pinDialog.submitting"
      :close-on-press-escape="!pinDialog.submitting"
      custom-class="pin-change-dialog"
      width="360px"
      :lock-scroll="false"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item :label="$t('CertOldPIN')">
          <el-input
            v-model="pinDialog.form.oldPin"
            type="password"
            :placeholder="$t('CertEnterOldPIN')"
            show-password
          />
        </el-form-item>
        <el-form-item :label="$t('CertNewPIN')">
          <el-input
            v-model="pinDialog.form.newPin1"
            type="password"
            :placeholder="$t('CertEnterNewPIN')"
            show-password
          />
        </el-form-item>
        <el-form-item :label="$t('CertConfirmPIN')">
          <el-input
            v-model="pinDialog.form.newPin2"
            type="password"
            :placeholder="$t('CertReEnterNewPIN')"
            show-password
          />
        </el-form-item>
        <el-alert
          v-if="pinDialog.error"
          :title="pinDialog.error"
          type="error"
          show-icon
          :closable="false"
          style="margin-top: 8px"
        />
      </el-form>
      <span slot="footer">
        <el-button :disabled="pinDialog.submitting" @click="cancelPinChange">{{ $t('Cancel') }}</el-button>
        <el-button type="primary" :loading="pinDialog.submitting" @click="confirmPinChange">{{ $t('Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import IBox from '@/components/Common/IBox'
import certDriverMixin from './certDriver'

export default {
  name: 'CertPanel',
  components: { TwoCol, IBox },
  mixins: [certDriverMixin],
  props: {
    // 'admin': admin manages another user's certificate; 'user': user self-manages their own certificate
    mode: {
      type: String,
      default: 'user',
      validator: v => ['admin', 'user'].includes(v)
    },
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      pinDialog: {
        visible: false,
        form: { oldPin: '', newPin1: '', newPin2: '' },
        error: '',
        submitting: false
      }
    }
  },
  computed: {
    certActions() {
      const cfg = this.getDriverConfig()
      const isAdmin = this.mode === 'admin'
      const enrollEnabled = this.driverConfigLoaded && !!(cfg?.cert?.enroll?.enabled)
      const hasPinDefault = this.driverConfigLoaded && (cfg?.cert?.pin?.default != null)
      const hasChangePIN = this.driverConfigLoaded && !!(cfg?.userChangePIN)
      const deviceReady = this.driverLoaded && this.deviceInserted

      const actions = [
        {
          key: 'issue_cert',
          has: isAdmin && enrollEnabled,
          title: this.$t('CertIssueCert'),
          hint: this.$t('CertIssueCertHint'),
          btnLabel: this.$t('CertIssueCert'),
          btnType: 'primary',
          icon: 'el-icon-s-authentication',
          disabled: !deviceReady,
          handler: this.handleIssueCert
        },
        {
          key: 'delete_cert',
          has: isAdmin && enrollEnabled,
          title: this.$t('CertDeleteCert'),
          hint: this.$t('CertDeleteCertHint'),
          btnLabel: this.$t('CertDeleteCert'),
          btnType: 'danger',
          disabled: !deviceReady,
          preConfirm: {
            title: this.$t('CertDeleteCert'),
            message: this.$t('CertDeleteCertConfirmMsg'),
            type: 'warning'
          },
          handler: this.handleDeleteCert
        },
        {
          key: 'reset_pin',
          has: isAdmin && hasPinDefault,
          title: this.$t('CertResetPIN'),
          hint: this.$t('CertResetPINHint'),
          btnLabel: this.$t('CertResetPIN'),
          btnType: 'warning',
          disabled: !deviceReady,
          prePrompt: {
            title: this.$t('CertResetPIN'),
            message: this.$t('CertEnterAdminPIN'),
            inputType: 'password',
            placeholder: this.$t('CertAdminPIN')
          },
          handler: this.handleResetPIN
        },
        {
          key: 'change_pin',
          has: hasChangePIN,
          title: this.$t('CertChangePIN'),
          hint: this.$t('CertChangePINHint'),
          btnLabel: this.$t('CertChangePIN'),
          btnType: 'primary',
          disabled: !deviceReady,
          skipExecReset: true,
          handler: this.showChangePinDialog
        }
      ]

      return actions.filter(a => a.has)
    }
  },
  methods: {
    // ── hooks ────────────────────────────────────────────────────
    getCertOwnerValue(fromObjectKey) {
      return this.object ? this.object[fromObjectKey] : null
    },

    statusItemFilter(item) {
      if (this.mode === 'user') return item.only !== 'admin'
      return true
    },

    // ── Admin: issue certificate flow ───────────────────────────
    async handleIssueCert() {
      const cfg = this.getDriverConfig()
      const enrollSteps = (cfg && cfg.enrollSteps) || []

      this.execSteps = enrollSteps.map(item => {
        const [key, stepCfg] = Object.entries(item)[0]
        return { key, title: stepCfg.description || key, status: 'wait', message: '' }
      })

      const output = {}
      const input = {}
      const context = { input, output, user: this.object, settings: this.publicSettings }

      for (let i = 0; i < enrollSteps.length; i++) {
        const [key, stepCfg] = Object.entries(enrollSteps[i])[0]
        await this.runStep(i, async () => {
          if (key === 'signCert') {
            try {
              const resp = await this.$axios.post('/api/v1/authentication/cert/enroll/', {
                user_id: this.object.id,
                csr: output.genCSR
              })
              Object.assign(output, resp)
              this.appendLog(this.$t('CertStepSucceeded', { step: stepCfg.description || key }), 'success')
            } catch (e) {
              const err = (e.response && e.response.data && e.response.data.error) || e.message || String(e)
              throw new Error(this.$t('CertStepFailed', { step: stepCfg.description || key, err }))
            }
          } else if (stepCfg.method) {
            const params = this.resolveStepParams(stepCfg.method.params, context)
            const result = this.callEnrollMethod(key, ...params)
            if (result !== undefined) output[key] = result
          }
        })
      }

      this.appendLog(this.$t('CertIssueCertDone'), 'success')
      this.refreshCertInfo()
      this.appendLog(this.$t('CertRefreshCertInfoDone'), 'success')
    },

    // ── Admin: delete certificate ────────────────────────────────
    async handleDeleteCert() {
      const cfg = this.getDriverConfig()
      const stepCfg = cfg && cfg.deleteCert
      if (!stepCfg || !stepCfg.method) {
        throw new Error(this.$t('CertDeleteCertMethodNotFound'))
      }
      this.callStep(stepCfg, 'deleteCert')
      this.appendLog(this.$t('CertDeleteCertDone'), 'success')
      this.refreshCertInfo()
    },

    // ── Admin: reset PIN ─────────────────────────────────────────
    async handleResetPIN(adminPin) {
      const cfg = this.getDriverConfig()
      const stepCfg = cfg && cfg.adminResetPIN
      if (!stepCfg || !stepCfg.method) {
        throw new Error(this.$t('CertAdminResetPINMethodNotFound'))
      }
      const defaultPin = cfg.cert && cfg.cert.pin && cfg.cert.pin.default
      const context = {
        input: { admin_pin: adminPin },
        output: { default_pin: defaultPin },
        user: this.object,
        settings: this.publicSettings
      }
      const params = this.resolveStepParams(stepCfg.method.params, context)
      this.callStep(stepCfg, 'adminResetPIN', ...params)
      this.appendLog(this.$t('CertResetPINDone'), 'success')
    },

    // ── User: change PIN dialog ───────────────────────────────────
    showChangePinDialog() {
      this.pinDialog.form = { oldPin: '', newPin1: '', newPin2: '' }
      this.pinDialog.error = ''
      this.pinDialog.submitting = false
      this.pinDialog.visible = true
    },

    cancelPinChange() {
      if (this.pinDialog.submitting) return
      this.pinDialog.visible = false
    },

    async confirmPinChange() {
      const { oldPin, newPin1, newPin2 } = this.pinDialog.form
      if (!oldPin || !newPin1 || !newPin2) {
        this.pinDialog.error = this.$t('CertFillAllFields')
        return
      }
      if (newPin1 !== newPin2) {
        this.pinDialog.error = this.$t('CertPINMismatch')
        return
      }
      this.pinDialog.error = ''
      this.pinDialog.submitting = true
      try {
        await this.handleChangePIN({ old_pin: oldPin, new_pin1: newPin1 })
        this.pinDialog.visible = false
      } catch (e) {
        this.pinDialog.error = e.message || this.$t('CertChangePINFailed')
      } finally {
        this.pinDialog.submitting = false
      }
    },

    // ── User: change PIN ─────────────────────────────────────────
    async handleChangePIN(inputs) {
      const cfg = this.getDriverConfig()
      const stepCfg = cfg && cfg.userChangePIN
      if (!stepCfg || !stepCfg.method) {
        throw new Error(this.$t('CertUserChangePINMethodNotFound'))
      }
      const context = {
        input: inputs,
        output: {},
        user: this.object,
        settings: this.publicSettings
      }
      const params = this.resolveStepParams(stepCfg.method.params, context)
      this.callStep(stepCfg, 'userChangePIN', ...params)
      this.appendLog(this.$t('CertChangePINDone'), 'success')
    }
  }
}
</script>

<style lang="scss" scoped>
.status-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid #f0f0f0;
    &:last-child { border-bottom: none; }
  }

  td {
    padding: 8px 0;
    font-size: 13px;
    vertical-align: middle;
  }

  .status-label {
    color: #909399;
    text-align: left;
    white-space: nowrap;
  }

  .status-value {
    text-align: right;
  }

  .status-text { color: #303133; }
}

.action-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid #f0f0f0;
    &:last-child { border-bottom: none; }
  }

  td { padding: 10px 0; vertical-align: middle; }

  .action-desc {
    padding-right: 12px;

    .action-title { font-size: 13px; color: #303133; line-height: 1.4; }
    .action-hint  { font-size: 12px; color: #909399; margin-top: 2px; line-height: 1.4; }
  }

  .action-btn {
    width: 72px;
    text-align: right;
    white-space: nowrap;

    ::v-deep .el-button { width: 100%; }
  }
}

.cert-logs {
  margin-top: 12px;

  .logs-box {
    background: #1e1e1e;
    border-radius: 4px;
    padding: 10px 14px;
    max-height: 160px;
    overflow-y: auto;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
  }

  .log-item {
    line-height: 1.8;
    display: flex;
    gap: 10px;

    .log-time { color: #6a9955; flex-shrink: 0; }
    .log-msg  { color: #d4d4d4; }

    &.log-success .log-msg { color: #4ec9b0; }
    &.log-error   .log-msg { color: #f48771; }
    &.log-warn    .log-msg { color: #dcdcaa; }
  }
}
</style>

<!-- PIN 弹框紧凑样式（append-to-body 挂载到 body，需非 scoped）-->
<style lang="scss">
.pin-change-dialog {
  .el-dialog__body {
    padding: 16px 20px 8px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .el-form-item {
    margin-bottom: 12px;
    &:last-child { margin-bottom: 0; }
  }
}
</style>
