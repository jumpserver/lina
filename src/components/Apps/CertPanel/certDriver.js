import { mapGetters } from 'vuex'

const DRIVER_SCRIPT_ID = 'cert-vendor-driver-sdk'
const DRIVER_SCRIPT_SRC = '/api/v1/authentication/cert/vendor-driver.js/'
const DRIVER_CONFIG = '/api/v1/authentication/cert/vendor-driver-config/'

// 模块级单例，避免 Vue 响应式代理破坏第三方对象
let ukey = null
let driverConfig = null

export default {
  data() {
    return {
      // driver / device state
      driverLoaded: false,
      driverLoadError: false,
      driverConfigLoaded: false,
      deviceInserted: false,
      basicInfoItems: [],

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
    ...mapGetters(['publicSettings']),

    statusItems() {
      return [
        {
          key: 'driver',
          label: '驱动状态',
          value: this.driverLoadError ? '加载失败' : this.driverLoaded ? '已加载' : '加载中',
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
        ...this.basicInfoItems
          .map(item => ({
            key: item.key,
            label: item.label,
            value: item.value,
            only: item.only,
            tag: undefined
          }))
      ].filter(item => this.statusItemFilter(item))
    },

    certInfoItems() {
      if (!this.certInfo) return []
      const certCfg = (driverConfig && driverConfig.getCertInfo) || {}

      const labelMap = {}
      for (const item of (certCfg.fields || [])) {
        const [key, cfg] = Object.entries(item)[0]
        labelMap[key] = (cfg && cfg.label) || key
      }

      const fromObjectKey = (certCfg.cnMatch && certCfg.cnMatch.fromObject) || 'username'
      const objectVal = this.getCertOwnerValue(fromObjectKey)
      const isSelf = objectVal != null && this.certInfo.CN != null &&
        String(this.certInfo.CN) === String(objectVal)
      const ownerItem = {
        key: 'cert_owner',
        label: '证书归属',
        value: objectVal != null
          ? (this.certInfo.CN != null ? (isSelf ? '当前用户' : '非当前用户') : '未知')
          : (this.certInfo.CN != null ? String(this.certInfo.CN) : '--'),
        tag: objectVal != null
          ? (this.certInfo.CN != null ? (isSelf ? 'success' : 'danger') : 'info')
          : undefined
      }

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
    // ── hook: 状态行过滤，组件可 override（返回 false 则隐藏该行）──────
    statusItemFilter(/* item */) {
      return true
    },

    // ── hook: 证书归属比对值，组件可 override ──────────────────────
    // fromObjectKey: config 指定的 object 字段名（如 'username'）
    getCertOwnerValue(/* fromObjectKey */) {
      return null
    },

    // ── 暴露 driverConfig 给组件使用 ─────────────────────────────
    getDriverConfig() {
      return driverConfig
    },

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
        const constructorName = driverConfig.newUKeyAPI &&
          driverConfig.newUKeyAPI.method &&
          driverConfig.newUKeyAPI.method.call
        if (!window[constructorName]) {
          throw new Error(`构造函数 "${constructorName}" 不存在，请确认驱动脚本已正确加载`)
        }
        ukey = new window[constructorName]('UKeyPlugin')
        this.driverLoaded = true
        this.appendLog(`驱动加载成功，实例已创建 (${constructorName})`, 'success')

        if (driverConfig.checkInstall) {
          try {
            this.callUKey('checkInstall')
            this.deviceInserted = true
          } catch (e) {
            this.deviceInserted = false
          }
        }

        this.basicInfoItems = []
        for (const infoItem of (driverConfig.showBasicInfo || [])) {
          const [key, cfg] = Object.entries(infoItem)[0]
          let value = '--'
          if (cfg.method && cfg.method.call) {
            try {
              const rawVal = ukey[cfg.method.call]()
              value = rawVal == null ? '--' : String(rawVal)
            } catch (e) { /* ignore */ }
          } else if (cfg.value !== undefined) {
            value = String(cfg.value)
          }
          this.basicInfoItems.push({ key, label: cfg.label, value, only: cfg.only })
        }

        this.refreshCertInfo()
      } catch (e) {
        this.driverLoadError = true
        this.appendLog('UKey 实例创建失败：' + e.message, 'error')
      }
    },

    // ── 操作分发 ─────────────────────────────────────────────────
    // action 可声明以下前置交互之一（优先级依次）：
    //   preDialog   : () => Promise<value>  自定义多字段表单
    //   preConfirm  : { title, message, type }  确认弹框
    //   prePrompt   : { title, message, inputType, placeholder }  单行输入
    async handleAction(action) {
      let preValue

      if (action.preDialog) {
        try {
          preValue = await action.preDialog()
        } catch (_) {
          return
        }
      } else if (action.preConfirm) {
        try {
          await this.$confirm(
            action.preConfirm.message,
            action.preConfirm.title,
            {
              type: action.preConfirm.type || 'warning',
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }
          )
        } catch (_) {
          return
        }
      } else if (action.prePrompt) {
        try {
          const { value } = await this.$prompt(
            action.prePrompt.message,
            action.prePrompt.title,
            {
              inputType: action.prePrompt.inputType || 'text',
              inputPlaceholder: action.prePrompt.placeholder || '',
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }
          )
          preValue = value
        } catch (_) {
          return
        }
      }

      if (!action.skipExecReset) {
        this.resetExec()
      }
      this.running = true
      this.currentAction = action.key
      try {
        await action.handler(preValue)
      } catch (e) {
        this.appendLog(e.message || '执行失败', 'error')
        const idx = this.execSteps.findIndex(s => s.status === 'process')
        if (idx !== -1) this.setStepStatus(idx, 'error', e.message || '')
      } finally {
        this.running = false
        this.currentAction = ''
      }
    },

    // ── 从 enrollSteps 数组中按 key 查找步骤配置 ─────────────────────
    findEnrollStep(key) {
      for (const item of (driverConfig.enrollSteps || [])) {
        if (key in item) return item[key]
      }
      return null
    },

    // ── 解析模板值 {{ scope.key }} ───────────────────────────────
    // context: { input, output, user, settings }
    resolveTemplateValue(tplStr, context) {
      if (typeof tplStr !== 'string') return tplStr
      const match = tplStr.match(/^\{\{\s*([\w]+(?:\.[\w]+)*)\s*\}\}$/)
      if (!match) return tplStr
      const parts = match[1].split('.')
      let val = context
      for (const p of parts) {
        if (val == null || typeof val !== 'object') return undefined
        val = val[p]
      }
      return val
    },

    // ── 解析步骤方法的全部参数，按顺序返回值列表 ─────────────────────
    // 参数值支持 {{ scope.key }} 模板语法，scope 可为 input/output/user/settings
    resolveStepParams(paramsCfg, context = {}) {
      const values = []
      for (const param of (paramsCfg || [])) {
        let value
        if (param.type === 'string' && param.items) {
          const dict = {}
          for (const item of param.items) {
            dict[item.key] = this.resolveTemplateValue(item.value, context)
          }
          value = JSON.stringify(dict)
        } else {
          value = this.resolveTemplateValue(param.value, context)
          if (value === undefined) value = param.default
          if (param.options && value in param.options) value = param.options[value]
          if (param.type === 'int') value = parseInt(value, 10)
        }
        values.push(value)
      }
      return values
    },

    // ── 底层：持有 step 配置对象后统一执行 ──────────────────────────────
    callStep(step, label, ...args) {
      const realMethod = step.method && step.method.call
      if (!realMethod || typeof ukey[realMethod] !== 'function') {
        const msg = `驱动实例中不存在方法：${realMethod}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      try {
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
      let value = raw
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value)
          if (Array.isArray(value)) value = value[0]
          if (typeof value === 'string') value = JSON.parse(value)
          if (value && typeof value === 'object') return value
          return null
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
        this.setStepStatus(index, 'error', e)
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
    }
  }
}
