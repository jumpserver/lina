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
      basicInfoItems: [], // 来自 showBasicInfo 配置的动态信息项

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
        ...this.basicInfoItems.map(item => ({
          key: item.key,
          label: item.label,
          value: item.value,
          tag: undefined
        })),
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
          disabled: !this.driverLoaded || !this.deviceInserted,
          handler: this.handleIssueCert
        }
        // TODO: 预留更多操作按钮
      ]
    },
    certInfoItems() {
      if (!this.certInfo) return []
      const certCfg = (driverConfig && driverConfig.getCertInfo) || {}
      // 从 fields 配置构建 key → label 映射
      const labelMap = {}
      for (const item of (certCfg.fields || [])) {
        const [key, cfg] = Object.entries(item)[0]
        labelMap[key] = (cfg && cfg.label) || key
      }
      // 证书归属：CN 与当前用户 id 比对，固定放第一行
      const isSelf = this.certInfo.CN != null && String(this.certInfo.CN) === String(this.object.id)
      const ownerItem = {
        key: 'cert_owner',
        label: '证书归属',
        value: this.certInfo.CN != null ? (isSelf ? '当前用户' : '非当前用户') : '未知',
        tag: this.certInfo.CN != null ? (isSelf ? 'success' : 'danger') : 'info'
      }
      // 按 showFields 顺序展示，无 showFields 时展示全部
      const showFields = certCfg.showFields || Object.keys(this.certInfo)
      const fieldItems = showFields
        .filter(key => key in this.certInfo)
        .map(key => {
          const value = this.certInfo[key]
          return {
            key,
            label: labelMap[key] || key,
            value: typeof value === 'boolean'
              ? (value ? '是' : '否')
              : String(value == null ? '' : value),
            tag: undefined
          }
        })
      return [ownerItem, ...fieldItems]
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
        const constructorName = driverConfig.newUKeyAPI && driverConfig.newUKeyAPI.method && driverConfig.newUKeyAPI.method.call
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
        // 读取 showBasicInfo 中定义的基础信息（版本、序列号等）
        this.basicInfoItems = []
        for (const infoItem of (driverConfig.showBasicInfo || [])) {
          const [key, cfg] = Object.entries(infoItem)[0]
          let value = '--'
          try {
            const rawVal = ukey[cfg.method.call]()
            value = rawVal == null ? '--' : String(rawVal)
          } catch (e) { /* ignore */ }
          this.basicInfoItems.push({ key, label: cfg.label, value })
        }
        // 读取证书信息
        this.refreshCertInfo()
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
      const enrollSteps = (driverConfig && driverConfig.enrollSteps) || []

      // 从配置动态构建步骤，title 取自配置的 description
      this.execSteps = enrollSteps.map(item => {
        const [key, cfg] = Object.entries(item)[0]
        return { key, title: cfg.description || key, status: 'wait', message: '' }
      })

      // 各步骤具体逻辑（参数传递、结果处理）
      let csr = null
      let signedCert = null
      const stepHandlers = {
        generateKeyPair: async (cfg) => {
          const paramsCfg = cfg.method && cfg.method.params
          const params = this.resolveStepParams(paramsCfg)
          console.log('generateKeyPair params:', params)
          await this.callEnrollMethod('generateKeyPair', ...params)
        },
        generateCSR: async (cfg) => {
          const paramsCfg = cfg.method && cfg.method.params
          const params = this.resolveStepParams(paramsCfg)
          csr = await this.callEnrollMethod('generateCSR', ...params)
        },
        signCert: async (cfg) => {
          // 内部步骤：将 CSR 提交到 Django CA 签发证书
          let resp
          try {
            resp = await this.$axios.post('/api/v1/authentication/cert/enroll/', {
              user: this.object.id,
              csr
            })
            signedCert = resp.signed_cert
            this.appendLog(`[${cfg.description || cfg.label}] 调用成功`, 'success')
          } catch (e) {
            const err = e.response?.data?.error || e.message || String(e)
            const errorMsg = `[${cfg.description || cfg.label}] 调用失败：${err}`
            throw new Error(errorMsg)
          }
        },
        deleteCertificate: async (cfg) => {
          await this.callEnrollMethod('deleteCertificate')
        },
        writeCertificate: async (cfg) => {
          const paramsCfg = cfg.method && cfg.method.params
          const params = this.resolveStepParams(paramsCfg)
          // 将标注了 fromSignedCert 的参数位置替换为已签发的证书内容
          ;(paramsCfg || []).forEach((p, i) => {
            console.log('p..........', p, i, signedCert)
            if (p.fromSignedCert === true) params[i] = signedCert
          })
          await this.callEnrollMethod('writeCertificate', ...params)
        }
      }

      for (let i = 0; i < enrollSteps.length; i++) {
        const [key, cfg] = Object.entries(enrollSteps[i])[0]
        const handler = stepHandlers[key] || (async (cfg) => { await this.callEnrollMethod(key) })
        await this.runStep(i, () => handler(cfg))
      }

      this.appendLog('[制证完成]', 'success')
      this.refreshCertInfo()
      this.appendLog('[读取证书完成]', 'success')
    },

    // ── 从 enrollSteps 数组中按 key 查找步骤配置 ─────────────────────
    findEnrollStep(key) {
      for (const item of (driverConfig.enrollSteps || [])) {
        if (key in item) return item[key]
      }
      return null
    },

    // ── 解析步骤方法的全部参数，按顺序返回值列表（通用） ─────────────────
    // 内部以 [{ key, value }] 存储，便于将来按需返回 dict
    // 优先级：items(fromObject) → fromConfig+options → default；type=int 做类型转换
    resolveStepParams(paramsCfg) {
      const entries = []
      for (const param of (paramsCfg || [])) {
        let value
        if (param.type === 'string' && param.items) {
          // 根据 items[].fromObject 从当前 object 取值，构建 dict
          const dict = {}
          for (const item of param.items) {
            if (item.fromObject !== undefined) {
              dict[item.key] = this.object[item.fromObject]
            }
          }
          if (param.type === 'string') {
            value = JSON.stringify(dict)
          }
          entries.push({ key: param.key, value })
          continue
        }
        const configVal = param.fromConfig ? this.publicSettings[param.fromConfig] : undefined

        if (configVal !== undefined) {
          value = configVal
        } else {
          value = param.default
        }
        if (param.options && value in param.options) {
          value = param.options[value]
        }
        // 类型转换
        if (param.type === 'int') {
          value = parseInt(value, 10)
        }
        entries.push({ key: param.key, value })
      }
      // 只返回按顺序排列的值列表
      return entries.map(e => e.value)
    },

    // ── 通过配置映射调用 UKey 方法 ────────────────────────────────
    // abstractName: driverConfig 中的抽象方法名，如 'getDeviceList'
    // args: 传给 driver 方法的参数
    // ── 底层：持有 step 配置对象后统一执行 ──────────────────────────────
    callStep(step, label, ...args) {
      const realMethod = step.method && step.method.call
      if (!realMethod || typeof ukey[realMethod] !== 'function') {
        const msg = `驱动实例中不存在方法：${realMethod}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      try {
        console.log('.......', realMethod, args)
        const result = ukey[realMethod](...args)
        this.appendLog(`[${step.description || label}] 调用成功`, 'success')
        return result
      } catch (e) {
        this.appendLog(`[${step.description || label}] 调用失败：${e}`, 'error')
        throw e
      }
    },

    // ── 通过顶级配置 key 调用驱动方法（如 checkInstall、getCertInfo）──────
    callUKey(abstractName, ...args) {
      const step = driverConfig[abstractName]
      if (!step) {
        const msg = `驱动配置中不存在方法映射：${abstractName}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      return this.callStep(step, abstractName, ...args)
    },

    // ── 通过制证配置（enrollSteps）调用驱动方法 ──────────────────────────
    callEnrollMethod(key, ...args) {
      const step = this.findEnrollStep(key)
      if (!step) {
        const msg = `制证配置中不存在步骤：${key}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      return this.callStep(step, key, ...args)
    },

    // ── 读取并刷新证书信息 ──────────────────────────────────────────
    refreshCertInfo() {
      if (!driverConfig || !driverConfig.getCertInfo) return
      try {
        this.certInfo = this.parseCertInfo(this.callUKey('getCertInfo'))
      } catch (e) {
        this.certInfo = null
      }
    },

    // ── 解析 getCertInfo 返回值 ───────────────────────────────────
    parseCertInfo(raw) {
      // 先尝试对字符串做 JSON.parse（处理 '[]'、'{}' 等情况）
      let value = raw
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value)
          if (Array.isArray(value)) {
            value = value[0]
          }
          if (typeof value === 'string') {
            value = JSON.parse(value)
          }
          if (value && typeof value === 'object') {
            return value
          } else {
            return null
          }
        } catch (_) {
          return null
        }
      }
    },

    // ── 执行单步 ─────────────────────────────────────────────────
    async runStep(index, fn) {
      this.setStepStatus(index, 'process', '')
      this.activeStep = index
      try {
        await fn()
        this.setStepStatus(index, 'finish', '')
        this.activeStep = index + 1
      } catch (e) {
        const msg = e
        this.setStepStatus(index, 'error', msg)
        throw e
      }
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
