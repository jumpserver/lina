<template>
  <div>
    <TwoCol>
      <template>
        <!-- 1. 状态展示 -->
        <IBox title="设备与驱动状态">
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

        <!-- 2. 操作按钮 -->
        <IBox title="操作" style="margin-top: 10px">
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

        <!-- 3. 操作日志 -->
        <IBox v-if="logs.length > 0" title="操作日志" style="margin-top: 10px">
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
        <!-- 证书信息 -->
        <IBox title="证书信息">
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
          <el-empty v-else description="暂未制证" :image-size="80" />
        </IBox>
      </template>
    </TwoCol>

    <!-- PIN 修改弹框（仅 user 模式） -->
    <el-dialog
      title="修改 PIN"
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
        <el-form-item label="旧 PIN">
          <el-input
            v-model="pinDialog.form.oldPin"
            type="password"
            placeholder="请输入旧 PIN"
            show-password
          />
        </el-form-item>
        <el-form-item label="新 PIN">
          <el-input
            v-model="pinDialog.form.newPin1"
            type="password"
            placeholder="请输入新 PIN"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认 PIN">
          <el-input
            v-model="pinDialog.form.newPin2"
            type="password"
            placeholder="再次输入新 PIN"
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
        <el-button :disabled="pinDialog.submitting" @click="cancelPinChange">取消</el-button>
        <el-button type="primary" :loading="pinDialog.submitting" @click="confirmPinChange">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import IBox from '@/components/Common/IBox'
import certDriverMixin from '@/mixins/certDriver'

export default {
  name: 'CertPanel',
  components: { TwoCol, IBox },
  mixins: [certDriverMixin],
  props: {
    // 'admin': 管理员操作他人证书；'user': 用户自助管理自己的证书
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
          title: '一键制证',
          hint: '检测设备、初始化 USB Key 并写入证书',
          btnLabel: '一键制证',
          btnType: 'primary',
          icon: 'el-icon-s-authentication',
          disabled: !deviceReady,
          handler: this.handleIssueCert
        },
        {
          key: 'delete_cert',
          has: isAdmin && enrollEnabled,
          title: '清除证书',
          hint: '清除 USB Key 中已存储的证书',
          btnLabel: '清除证书',
          btnType: 'danger',
          disabled: !deviceReady,
          preConfirm: {
            title: '清除证书',
            message: '确认要清除 USB Key 中的证书吗？此操作不可恢复。',
            type: 'warning'
          },
          handler: this.handleDeleteCert
        },
        {
          key: 'reset_pin',
          has: isAdmin && hasPinDefault,
          title: '重置 PIN',
          hint: '使用管理员 PIN 将 USB Key 的用户 PIN 重置为默认值',
          btnLabel: '重置 PIN',
          btnType: 'warning',
          disabled: !deviceReady,
          prePrompt: {
            title: '重置 PIN',
            message: '请输入管理员 PIN',
            inputType: 'password',
            placeholder: '管理员 PIN'
          },
          handler: this.handleResetPIN
        },
        {
          key: 'change_pin',
          has: hasChangePIN,
          title: '修改 PIN',
          hint: '修改 USB Key 的用户 PIN 码',
          btnLabel: '修改 PIN',
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
      if (this.mode === 'user') return item.value !== 'admin'
      return true
    },

    // ── 管理员：制证流程 ─────────────────────────────────────────
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
              this.appendLog(`[${stepCfg.description || key}] 调用成功`, 'success')
            } catch (e) {
              const err = (e.response && e.response.data && e.response.data.error) || e.message || String(e)
              throw new Error(`[${stepCfg.description || key}] 调用失败：${err}`)
            }
          } else if (stepCfg.method) {
            const params = this.resolveStepParams(stepCfg.method.params, context)
            const result = this.callEnrollMethod(key, ...params)
            if (result !== undefined) output[key] = result
          }
        })
      }

      this.appendLog('[制证完成]', 'success')
      this.refreshCertInfo()
      this.appendLog('[读取证书完成]', 'success')
    },

    // ── 管理员：清除证书 ──────────────────────────────────────────
    async handleDeleteCert() {
      const cfg = this.getDriverConfig()
      const stepCfg = cfg && cfg.deleteCert
      if (!stepCfg || !stepCfg.method) {
        throw new Error('驱动配置中未找到 deleteCert 方法')
      }
      this.callStep(stepCfg, 'deleteCert')
      this.appendLog('[清除证书完成]', 'success')
      this.refreshCertInfo()
    },

    // ── 管理员：重置 PIN ──────────────────────────────────────────
    async handleResetPIN(adminPin) {
      const cfg = this.getDriverConfig()
      const stepCfg = cfg && cfg.adminResetPIN
      if (!stepCfg || !stepCfg.method) {
        throw new Error('驱动配置中未找到 adminResetPIN 方法')
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
      this.appendLog('[重置 PIN 完成]', 'success')
    },

    // ── 用户：PIN 修改弹框 ────────────────────────────────────────
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
        this.pinDialog.error = '请填写所有字段'
        return
      }
      if (newPin1 !== newPin2) {
        this.pinDialog.error = '两次输入的新 PIN 不一致'
        return
      }
      this.pinDialog.error = ''
      this.pinDialog.submitting = true
      try {
        await this.handleChangePIN({ old_pin: oldPin, new_pin1: newPin1 })
        this.pinDialog.visible = false
      } catch (e) {
        this.pinDialog.error = e.message || '修改失败，请重试'
      } finally {
        this.pinDialog.submitting = false
      }
    },

    // ── 用户：修改 PIN ────────────────────────────────────────────
    async handleChangePIN(inputs) {
      const cfg = this.getDriverConfig()
      const stepCfg = cfg && cfg.userChangePIN
      if (!stepCfg || !stepCfg.method) {
        throw new Error('驱动配置中未找到 userChangePIN 方法')
      }
      const context = {
        input: inputs,
        output: {},
        user: this.object,
        settings: this.publicSettings
      }
      const params = this.resolveStepParams(stepCfg.method.params, context)
      this.callStep(stepCfg, 'userChangePIN', ...params)
      this.appendLog('[修改 PIN 完成]', 'success')
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
    width: 110px;
    color: #909399;
    flex-shrink: 0;
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
