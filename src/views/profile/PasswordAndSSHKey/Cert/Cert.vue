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
        <IBox
          v-if="logs.length > 0"
          title="操作日志"
          style="margin-top: 10px"
        >
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

    <!-- PIN 修改弹框 -->
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
  name: 'Cert',
  components: { TwoCol, IBox },
  mixins: [certDriverMixin],
  props: {
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
      const hasChangePIN = this.driverConfigLoaded && !!(cfg && cfg.userChangePIN)
      const actions = []
      if (hasChangePIN) {
        actions.push({
          key: 'change_pin',
          title: '修改 PIN',
          hint: '修改 USB Key 的用户 PIN 码',
          btnLabel: '修改 PIN',
          btnType: 'primary',
          disabled: !this.driverLoaded || !this.deviceInserted,
          skipExecReset: true,
          handler: this.showChangePinDialog
        })
      }
      return actions
    }
  },
  methods: {
    getCertOwnerValue(fromObjectKey) {
      return this.object ? this.object[fromObjectKey] : null
    },

    statusItemFilter(item) {
      return item.only !== 'admin'
    },

    // ── PIN 修改弹框 ──────────────────────────────────────────────
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

    // ── 修改 PIN（用户自助）──────────────────────────────────────
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
// ── 状态表格 ──────────────────────────────────────────────────────
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

  .status-text {
    color: #303133;
  }
}

// ── 操作按钮表格 ──────────────────────────────────────────────────
.action-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }
  }

  td {
    padding: 10px 0;
    vertical-align: middle;
  }

  .action-desc {
    padding-right: 12px;

    .action-title {
      font-size: 13px;
      color: #303133;
      line-height: 1.4;
    }

    .action-hint {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
      line-height: 1.4;
    }
  }

  .action-btn {
    width: 72px;
    text-align: right;
    white-space: nowrap;

    ::v-deep .el-button {
      width: 100%;
    }
  }
}

// ── 操作日志 ──────────────────────────────────────────────────────
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

// ── PIN 修改弹框 ──────────────────────────────────────────────────
.pin-dialog-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
  padding-left: 80px;
}</style>

<!-- 弹框紧凑样式（append-to-body 挂载到 body，需独立非 scoped 块）-->
<style lang="scss">
.pin-change-dialog {
  .el-dialog__body {
    padding: 16px 20px 8px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .el-form-item {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}</style>
