import { mapGetters } from 'vuex'

const DRIVER_SCRIPT_ID = 'cert-vendor-driver-sdk'
const DRIVER_SCRIPT_SRC = '/api/v1/authentication/cert/vendor-driver.js/'
const DRIVER_CONFIG = '/api/v1/authentication/cert/vendor-driver-config/'

// Module-level singletons — prevent Vue reactive proxy from corrupting third-party objects
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
          label: this.$t('CertDriverStatus'),
          value: this.driverLoadError ? this.$t('CertLoadFailed') : this.driverLoaded ? this.$t('CertLoaded') : this.$t('CertLoading'),
          tag: this.driverLoadError ? 'danger' : this.driverLoaded ? 'success' : 'info'
        },
        {
          key: 'driver_config',
          label: this.$t('CertDriverConfig'),
          value: this.driverConfigLoaded ? this.$t('CertLoaded') : this.$t('CertNotLoaded'),
          tag: this.driverConfigLoaded ? 'success' : 'warning'
        },
        {
          key: 'device',
          label: 'USB Key',
          value: this.deviceInserted ? this.$t('CertDeviceInserted') : this.$t('CertDeviceNotInserted'),
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
        label: this.$t('CertOwner'),
        value: objectVal != null
          ? (this.certInfo.CN != null ? (isSelf ? this.$t('CertOwnerSelf') : this.$t('CertOwnerOther')) : this.$t('CertOwnerUnknown'))
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
              ? (value ? this.$t('Yes') : this.$t('No'))
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
    // ── Hook: filter status rows; component can override (return false to hide a row) ──
    statusItemFilter(/* item */) {
      return true
    },

    // ── Hook: cert owner comparison value; component can override ────────────────────
    // fromObjectKey: object field name specified by config (e.g. 'username')
    getCertOwnerValue(/* fromObjectKey */) {
      return null
    },

    // ── Expose driverConfig to components ────────────────────────────────────────────
    getDriverConfig() {
      return driverConfig
    },

    // ── Load driver config ────────────────────────────────────────────────────────────
    async loadDriverConfig() {
      try {
        driverConfig = await this.$axios.get(DRIVER_CONFIG)
        this.driverConfigLoaded = true
        this.appendLog('Driver config loaded', 'success')
      } catch (e) {
        this.appendLog('Driver config load failed: ' + e.message, 'error')
        throw e
      }
    },

    // ── Load vendor driver JS and create instance ───────────────────────────────────
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
        this.appendLog('Driver load failed, please check the backend service', 'error')
      }
      document.body.appendChild(script)
    },

    // ── Create UKey instance using config mapping ──────────────────────────────────
    initUKeyInstance() {
      try {
        const constructorName = driverConfig.newUKeyAPI &&
          driverConfig.newUKeyAPI.method &&
          driverConfig.newUKeyAPI.method.call
        if (!window[constructorName]) {
          throw new Error(`Constructor "${constructorName}" not found, please verify the driver script is loaded correctly`)
        }
        ukey = new window[constructorName]('UKeyPlugin')
        this.driverLoaded = true
        this.appendLog(`Driver loaded, instance created (${constructorName})`, 'success')

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
        this.appendLog('UKey instance creation failed: ' + e.message, 'error')
      }
    },

    // ── Action dispatcher ─────────────────────────────────────────────────
    // An action may declare one of the following pre-interactions (in priority order):
    //   preDialog   : () => Promise<value>  custom multi-field form
    //   preConfirm  : { title, message, type }  confirmation dialog
    //   prePrompt   : { title, message, inputType, placeholder }  single-line input
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
              confirmButtonText: this.$t('Confirm'),
              cancelButtonText: this.$t('Cancel')
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
              confirmButtonText: this.$t('Confirm'),
              cancelButtonText: this.$t('Cancel')
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
        this.appendLog(e.message || 'Execution failed', 'error')
        const idx = this.execSteps.findIndex(s => s.status === 'process')
        if (idx !== -1) this.setStepStatus(idx, 'error', e.message || '')
      } finally {
        this.running = false
        this.currentAction = ''
      }
    },

    // ── Find step config by key from enrollSteps array ───────────────────────────────
    findEnrollStep(key) {
      for (const item of (driverConfig.enrollSteps || [])) {
        if (key in item) return item[key]
      }
      return null
    },

    // ── Resolve template value {{ scope.key }} ────────────────────────────────────────
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

    // ── Resolve all params for a step method, return as ordered list ──────────────────
    // Param values support {{ scope.key }} template syntax; scope can be input/output/user/settings
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

    // ── Core: execute a step given its config object ────────────────────────────────
    callStep(step, label, ...args) {
      const realMethod = step.method && step.method.call
      if (!realMethod || typeof ukey[realMethod] !== 'function') {
        const msg = `Method not found in driver instance: ${realMethod}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      try {
        const result = ukey[realMethod](...args)
        this.appendLog(`[${step.description || label}] succeeded`, 'success')
        return result
      } catch (e) {
        this.appendLog(`[${step.description || label}] failed: ${e}`, 'error')
        throw e
      }
    },

    // ── Call driver method by top-level config key (e.g. checkInstall, getCertInfo) ──
    callUKey(abstractName, ...args) {
      const step = driverConfig[abstractName]
      if (!step) {
        const msg = `Method mapping not found in driver config: ${abstractName}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      return this.callStep(step, abstractName, ...args)
    },

    // ── Call driver method via enroll config (enrollSteps) ──────────────────────────
    callEnrollMethod(key, ...args) {
      const step = this.findEnrollStep(key)
      if (!step) {
        const msg = `Step not found in enroll config: ${key}`
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }
      return this.callStep(step, key, ...args)
    },

    // ── Read and refresh certificate info ──────────────────────────────────────────
    refreshCertInfo() {
      if (!driverConfig || !driverConfig.getCertInfo) return
      try {
        this.certInfo = this.parseCertInfo(this.callUKey('getCertInfo'))
      } catch (e) {
        this.certInfo = null
      }
    },

    // ── Parse getCertInfo return value ────────────────────────────────────────────
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

    // ── Execute a single step ────────────────────────────────────────────────────────
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
