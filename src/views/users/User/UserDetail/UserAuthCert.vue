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
</template>

<script>
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import IBox from '@/components/Common/IBox'
import { mapGetters } from 'vuex'

const DRIVER_SCRIPT_ID = 'cert-vendor-driver-sdk'
const DRIVER_SCRIPT_SRC = '/api/v1/authentication/cert/vendor-driver.js/'
const DRIVER_CONFIG = '/api/v1/authentication/cert/vendor-driver-config/'

// 模块级变量，避免 Vue 响应式代理破坏第三方对象
let ukey = null
let driverConfig = null

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
      deviceVersion: '',
      deviceSN: '',

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
          key: 'device',
          label: 'USB Key',
          value: this.deviceInserted ? '已插入' : '未插入',
          tag: this.deviceInserted ? 'success' : 'warning'
        },
        {
          key: 'device_version',
          label: '设备版本',
          value: this.deviceVersion,
          tag: undefined
        },
        {
          key: 'device_sn',
          label: '设备序列号',
          value: this.deviceSN,
          tag: undefined
        },
        {
          key: 'sign_algo',
          label: '签名算法',
          value: this.signAlgorithm,
          tag: undefined
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
    },
    certInfoItems() {
      if (!this.certInfo) return []
      console.log('Cert Info:', this.certInfo)
      // 直接将 getCertInfo 返回的 JSON 字段转为列表展示
      // TODO: 按需调整 label 映射或字段顺序
      return Object.entries(this.certInfo).map(([key, value]) => ({
        key,
        label: key,
        value: typeof value === 'boolean'
          ? (value ? '是' : '否')
          : String(value == null ? '' : value),
        tag: undefined
      }))
    }
  },
  async mounted() {
    await this.loadDriverConfig()
    this.loadVendorDriver()
  },
  methods: {
    // ── 加载驱动配置 ─────────────────────────────────────────────
    async loadDriverConfig() {
      try {
        driverConfig = await this.$axios.get(DRIVER_CONFIG)
        this.driverConfigLoaded = true
        this.appendLog('驱动配置加载成功', 'success')
      } catch (e) {
        this.appendLog('驱动配置加载失败：' + e.message, 'error')
        throw e
      }
    },

    // ── 加载驱动 JS 并创建实例 ────────────────────────────────────
    loadVendorDriver() {
      if (document.getElementById(DRIVER_SCRIPT_ID)) {
        // 脚本已存在，直接初始化实例
        this.initUKeyInstance()
        return
      }
      const script = document.createElement('script')
      script.id = DRIVER_SCRIPT_ID
      script.src = DRIVER_SCRIPT_SRC
      script.async = true
      script.onload = () => this.initUKeyInstance()
      script.onerror = () => {
        this.driverLoadError = true
        this.appendLog('驱动加载失败，请检查后端服务', 'error')
      }
      document.body.appendChild(script)
    },

    // ── 用配置映射创建 UKey 实例 ──────────────────────────────────
    initUKeyInstance() {
      try {
        const constructorName = driverConfig.newUKeyAPI
        if (!window[constructorName]) {
          throw new Error(`构造函数 "${constructorName}" 不存在，请确认驱动脚本已正确加载`)
        }
        ukey = new window[constructorName]('UKeyPlugin')
        this.driverLoaded = true
        this.signAlgorithm = this.publicSettings['AUTH_CERT_ENROLL_KEY_ALGO']
        this.appendLog(`驱动加载成功，实例已创建 (${constructorName})`, 'success')
        // 检测设备是否已插入
        if (driverConfig.checkInstall) {
          try {
            this.callUKey('checkInstall')
            this.deviceInserted = true
          } catch (e) {
            this.deviceInserted = false
          }
        }
        // 读取设备版本
        if (driverConfig.getVersion) {
          try {
            this.deviceVersion = this.callUKey('getVersion')
          } catch (e) {
            this.deviceVersion = ''
          }
        }
        // 读取设备序列号
        if (driverConfig.getDevSN) {
          try {
            this.deviceSN = this.callUKey('getDevSN')
          } catch (e) {
            this.deviceSN = ''
          }
        }
        // 读取证书信息
        if (driverConfig.getCertInfo) {
          try {
            this.certInfo = this.parseCertInfo(this.callUKey('getCertInfo'))
          } catch (e) {
            this.certInfo = null
          }
        }
      } catch (e) {
        this.driverLoadError = true
        this.appendLog('UKey 实例创建失败：' + e.message, 'error')
      }
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
        // driverConfig.checkInstall => 实际方法名，如 "UKey_CheckInstall"
        // TODO: await this.callUKey('checkInstall')
      })
      await this.runStep(1, '检测 USB Key 设备', async () => {
        // TODO: const devices = await this.callUKey('getDeviceList')
        // this.deviceInserted = devices.length > 0
        this.deviceInserted = true
      })
      await this.runStep(2, '初始化 USB Key', async () => {
        // TODO: await this.callUKey('generateKeyPair', { algo: this.signAlgorithm })
      })
      await this.runStep(3, '生成证书', async () => {
        // TODO: const csr = await this.callUKey('generateCSR', { userId: this.object.id })
        // TODO: const { data } = await this.$axios.post('/api/v1/authentication/cert/generate/', { user: this.object.id, csr })
      })
      await this.runStep(4, '写入证书', async () => {
        // TODO: await this.callUKey('writeCertificate', certData)
        // this.certInfo = data.cert_info
      })

      this.appendLog('制证完成', 'success')
    },

    // ── 通过配置映射调用 UKey 方法 ────────────────────────────────
    // abstractName: driverConfig 中的抽象方法名，如 'getDeviceList'
    // args: 传给 driver 方法的参数
    callUKey(abstractName, ...args) {
      const realMethod = driverConfig[abstractName]
      if (!realMethod) {
        const msg = `驱动配置中不存在方法映射：${abstractName}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      if (typeof ukey[realMethod] !== 'function') {
        const msg = `驱动实例中不存在方法：${realMethod}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      try {
        const result = ukey[realMethod](...args)
        this.appendLog(`[${abstractName}] 调用成功`, 'success')
        return result
      } catch (e) {
        this.appendLog(`[${abstractName}] 调用失败：${e.message}`, 'error')
        throw e
      }
    },

    // ── 解析 getCertInfo 返回值 ───────────────────────────────────
    parseCertInfo(raw) {
      // 先尝试对字符串做 JSON.parse（处理 '[]'、'{}' 等情况）
      let value = raw
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value)
        } catch (_) {
          return null
        }
      }
      // 如果是数组，取第一个元素
      if (Array.isArray(value)) {
        value = value[0]
      }

      if (typeof value === 'string') {
        try {
          value = JSON.parse(value)
        } catch (_) {
          return null
        }
      }
      // 确保最终是普通对象
      return value && typeof value === 'object' ? value : null
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
