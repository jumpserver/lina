<template>
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
        <div v-if="certInfo" class="cert-info-body">
          <div class="cert-info-row">
            <span class="label">序列号</span>
            <span class="value">{{ certInfo.serialNumber }}</span>
          </div>
          <div class="cert-info-row">
            <span class="label">主体</span>
            <span class="value">{{ certInfo.subject }}</span>
          </div>
          <div class="cert-info-row">
            <span class="label">生效时间</span>
            <span class="value">{{ certInfo.notBefore }}</span>
          </div>
          <div class="cert-info-row">
            <span class="label">过期时间</span>
            <span class="value">{{ certInfo.notAfter }}</span>
          </div>
          <div class="cert-info-row">
            <span class="label">状态</span>
            <el-tag :type="certInfo.valid ? 'success' : 'danger'" size="small">
              {{ certInfo.valid ? '有效' : '已失效' }}
            </el-tag>
          </div>
        </div>
        <el-empty v-else description="暂未制证" :image-size="80" />
      </IBox>
    </template>
  </TwoCol>
</template>

<script>
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import IBox from '@/components/Common/IBox'
import { mapGetters } from 'vuex'

const DRIVER_SCRIPT_ID = 'cert-vendor-driver-sdk'
const DRIVER_SCRIPT_SRC = '/api/v1/authentication/cert/vendor-driver.js/'

export default {
  name: 'UserAuthCert',
  components: { TwoCol, IBox },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // driver / device state
      driverLoaded: false,
      driverLoadError: false,
      driverConfigLoaded: false,
      signAlgorithm: '',
      deviceInserted: false,

      // execution state
      running: false,
      currentAction: '',
      activeStep: 0,
      execSteps: [],
      logs: [],

      // cert
      certInfo: null
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings'
    ]),
    statusItems() {
      return [
        {
          key: 'driver',
          label: '驱动状态',
          value: this.driverLoadError
            ? '加载失败'
            : this.driverLoaded ? '已加载' : '加载中',
          tag: this.driverLoadError ? 'danger' : this.driverLoaded ? 'success' : 'info'
        },
        {
          key: 'driver_config',
          label: '驱动配置',
          value: this.driverConfigLoaded ? '已加载' : '未加载',
          tag: this.driverConfigLoaded ? 'success' : 'warning'
        },
        {
          key: 'sign_algo',
          label: '签名算法',
          value: this.signAlgorithm,
          tag: undefined
        },
        {
          key: 'device',
          label: 'USB Key',
          value: this.deviceInserted ? '已插入' : '未插入',
          tag: this.deviceInserted ? 'success' : 'warning'
        }
        // TODO: 预留更多状态项
      ]
    },
    certActions() {
      return [
        {
          key: 'issue_cert',
          title: '一键制证',
          hint: '检测设备、初始化 USB Key 并写入证书',
          btnLabel: '开始制证',
          btnType: 'primary',
          icon: 'el-icon-s-authentication',
          disabled: !this.driverLoaded,
          handler: this.handleIssueCert
        }
        // TODO: 预留更多操作按钮
      ]
    }
  },
  mounted() {
    this.loadVendorDriver()
  },
  methods: {
    // ── Driver 加载 ──────────────────────────────────────────────
    loadVendorDriver() {
      if (document.getElementById(DRIVER_SCRIPT_ID)) {
        this.driverLoaded = true
        return
      }
      const script = document.createElement('script')
      script.id = DRIVER_SCRIPT_ID
      script.src = DRIVER_SCRIPT_SRC
      script.async = true
      script.onload = () => {
        this.driverLoaded = true
        this.appendLog('驱动 SDK 加载成功', 'success')
        // TODO: 读取 driver 配置、签名算法等初始信息
        // this.driverConfigLoaded = ...
        this.signAlgorithm = this.publicSettings['AUTH_CERT_ENROLL_KEY_ALGO']
      }
      script.onerror = () => {
        this.driverLoadError = true
        this.appendLog('驱动 SDK 加载失败，请检查后端服务', 'error')
      }
      document.body.appendChild(script)
    },

    // ── 操作分发 ─────────────────────────────────────────────────
    async handleAction(action) {
      this.resetExec()
      this.running = true
      this.currentAction = action.key
      try {
        await action.handler()
      } catch (e) {
        this.appendLog(e.message || '执行失败', 'error')
        const idx = this.execSteps.findIndex(s => s.status === 'process')
        if (idx !== -1) this.setStepStatus(idx, 'error', e.message || '')
      } finally {
        this.running = false
        this.currentAction = ''
      }
    },

    // ── 制证流程 ─────────────────────────────────────────────────
    async handleIssueCert() {
      this.execSteps = [
        { key: 'detect_driver', title: '检测驱动环境', status: 'wait', message: '' },
        { key: 'detect_device', title: '检测 USB Key 设备', status: 'wait', message: '' },
        { key: 'init_key', title: '初始化 USB Key', status: 'wait', message: '' },
        { key: 'generate_cert', title: '生成证书', status: 'wait', message: '' },
        { key: 'write_cert', title: '写入证书', status: 'wait', message: '' }
      ]

      await this.runStep(0, '检测驱动环境', async () => {
        // TODO: await window.CertVendorSDK.detectDriver()
      })
      await this.runStep(1, '检测 USB Key 设备', async () => {
        // TODO: await window.CertVendorSDK.detectDevice()
        this.deviceInserted = true
      })
      await this.runStep(2, '初始化 USB Key', async () => {
        // TODO: await window.CertVendorSDK.initKey({ userId: this.object.id })
      })
      await this.runStep(3, '生成证书', async () => {
        // TODO: const { data } = await this.$http.post('/api/v1/authentication/cert/generate/', { user: this.object.id })
      })
      await this.runStep(4, '写入证书', async () => {
        // TODO: await window.CertVendorSDK.writeCert({ certData, userId: this.object.id })
        // this.certInfo = data.cert_info
      })

      this.appendLog('制证完成', 'success')
    },

    // ── 执行单步 ─────────────────────────────────────────────────
    async runStep(index, label, fn) {
      this.setStepStatus(index, 'process', '')
      this.activeStep = index
      this.appendLog(label + '...')
      await fn()
      this.setStepStatus(index, 'finish', '')
      this.activeStep = index + 1
    },

    setStepStatus(index, status, message = '') {
      this.$set(this.execSteps, index, { ...this.execSteps[index], status, message })
    },

    appendLog(message, level = 'info') {
      const time = new Date().toLocaleTimeString()
      this.logs.push({ time, message, level })
      this.$nextTick(() => {
        if (this.$refs.logBox) {
          this.$refs.logBox.scrollTop = this.$refs.logBox.scrollHeight
        }
      })
    },

    resetExec() {
      this.activeStep = 0
      this.execSteps = []
      this.logs = []
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
    width: 90px;
    text-align: right;
    white-space: nowrap;
  }
}

// ── 执行进度 ──────────────────────────────────────────────────────
.exec-steps {
  ::v-deep .el-step__description {
    font-size: 12px;
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

// ── 右侧证书信息 ──────────────────────────────────────────────────
.cert-info-body {
  .cert-info-row {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;

    &:last-child { border-bottom: none; }

    .label {
      width: 90px;
      flex-shrink: 0;
      color: #909399;
    }

    .value {
      color: #303133;
      word-break: break-all;
    }
  }
}
</style>
