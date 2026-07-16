<template>
  <div>
    <TwoCol>
      <template #default>
        <!-- 左上：设备驱动状态 -->
        <IBox :title="$t('DeviceDriverStatus')">
          <table class="cp-info-table">
            <tbody>
              <tr v-for="item in statusItems" :key="item.key">
                <td class="cp-label">{{ item.label }}</td>
                <td class="cp-value">
                  <el-tag
                    v-if="item.tag !== undefined"
                    :type="item.tag"
                    size="small"
                    effect="plain"
                  >
                    {{ item.value }}
                  </el-tag>
                  <span v-else class="cp-text">{{ item.value || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </IBox>

        <!-- 左中：操作按钮 -->
        <IBox :title="$t('Operation')" style="margin-top: 10px">
          <table v-if="operationWhenPassed && visibleOperations.length > 0" class="cp-action-table">
            <tbody>
              <tr v-for="op in visibleOperations" :key="op.key">
                <td class="cp-action-desc">
                  <div class="cp-action-title">{{ op.label }}</div>
                  <div v-if="op.hint" class="cp-action-hint">{{ op.hint }}</div>
                </td>
                <td class="cp-action-btn">
                  <el-button
                    :type="op.btnType || 'primary'"
                    :disabled="!deviceReady || running || op._disabled"
                    size="small"
                    @click="handleOperation(op)"
                  >
                    {{ op.label }}
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else style="color: #909399; font-size: 13px; padding: 12px 0; text-align: center">
            {{ $t('NoAvailableActions') }}
          </div>
        </IBox>

        <!-- 左下：操作日志 -->
        <IBox v-if="logs.length > 0" :title="$t('OperationLogs')" style="margin-top: 10px">
          <div ref="logBox" class="cp-logs-box">
            <div v-for="(log, i) in logs" :key="i" :class="['cp-log-item', `cp-log-${log.level}`]">
              <span class="cp-log-time">{{ log.time }}</span>
              <span class="cp-log-msg">{{ log.message }}</span>
            </div>
          </div>
        </IBox>
      </template>

      <template #right>
        <!-- 右上：证书信息 -->
        <IBox :title="$t('CertificateInfo')">
          <div v-if="infoWhenPassed && certLoading" class="cp-cert-loading">
            <i class="el-icon-loading" />
            <span>{{ $t('Loading') }}</span>
          </div>
          <table v-else-if="infoWhenPassed && hasCert" class="cp-info-table">
            <tbody>
              <tr v-for="item in certInfoItems" :key="item.key">
                <td class="cp-label">{{ item.label }}</td>
                <td class="cp-value">
                  <el-tag
                    v-if="item.tag !== undefined"
                    :type="item.tag"
                    size="small"
                    effect="plain"
                    :title="item.value"
                  >
                    {{ item.value }}
                  </el-tag>
                  <span v-else class="cp-text" :title="item.value">{{ item.value || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <el-empty
            v-else
            :description="infoWhenPassed ? $t('NoCertificateIssued') : $t('NoCertificateInfo')"
            :image-size="80"
            class="cp-cert-empty"
          />
        </IBox>
      </template>
    </TwoCol>

    <!-- 通用输入弹框（步骤内 input 配置驱动） -->
    <el-dialog
      :title="inputDialog.title"
      v-model="inputDialog.visible"
      :before-close="cancelInputDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      width="480px"
      :lock-scroll="false"
      append-to-body
      custom-class="cp-input-dialog"
    >
      <el-form label-width="0px" class="cp-input-form" @submit.prevent="confirmInputDialog">
        <el-form-item
          v-for="f in inputDialog.fields"
          :key="f.key"
          :label="f.label"
          :label-width="inputDialog.labelWidth"
        >
          <el-input
            v-model="inputDialog.form[f.key]"
            :type="f.type === 'password' ? 'password' : 'text'"
            :show-password="f.type === 'password'"
            :placeholder="f.placeholder || ''"
          />
        </el-form-item>
        <el-alert
          v-if="inputDialog.error"
          :title="inputDialog.error"
          type="error"
          show-icon
          :closable="false"
          style="margin-top: 6px"
        />
      </el-form>
      <template #footer>
        <el-button @click="cancelInputDialog">{{ $t('Cancel') }}</el-button>
        <el-button type="primary" @click="confirmInputDialog">{{ $t('Confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import IBox from '@/components/Common/IBox'

const CONFIG_API = '/api/v1/authentication/ukey/ukey-sdk-config/'

const SCRIPT_TAG_ID = 'ukey-sdk-script'

// 模块级单例 — 防止 Vue 响应式代理污染第三方 SDK 对象
let _instance = null // UKey SDK 实例
let _ukey = {} // ukey.* 命名空间（sdk.setup.steps register 的变量）
let _userOverride = null // user.* 命名空间覆盖（操作步骤 register: user 写入）

export default {
  name: 'UKeyPanel',
  components: { TwoCol, IBox },

  props: {
    /** 'admin': 管理员管理他人证书；'user': 用户自管理 */
    mode: {
      type: String,
      default: 'user',
      validator: (v) => ['admin', 'user'].includes(v)
    },
    /** 被管理的用户对象（admin 模式必传） */
    object: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      sdkConfig: null,
      config: {},
      configLoaded: false,
      sdkLoaded: false,

      deviceInfoItems: [], // [{ key, label, value, scope }]
      certInfoItems: [], // [{ key, label, value, tag? }]
      certLoading: true,
      hasCert: false,
      infoWhenFalseLogged: false,
      operationWhenFalseLogged: false,

      running: false,
      currentOperation: '',
      logs: [],

      ukeySnapshot: {}, // _ukey 的响应式镜像，驱动 computed 重算

      inputDialog: {
        visible: false,
        title: '',
        fields: [],
        labelWidth: '120px',
        form: {},
        error: '',
        _resolve: null,
        _reject: null
      }
    }
  },

  computed: {
    ...mapGetters(['publicSettings']),

    operationsConfig() {
      const operations = this.sdkConfig?.operations
      if (operations && typeof operations === 'object') {
        return {
          when: operations.when,
          items: Array.isArray(operations.items) ? operations.items : []
        }
      }
      return { when: undefined, items: [] }
    },

    infoWhenPassed() {
      return this.evaluateWhen(this.sdkConfig?.info?.when)
    },

    operationWhenPassed() {
      return this.evaluateWhen(this.operationsConfig.when)
    },

    // ── 左上状态面板：固定行 + config.info.device 动态行 ──────────────────────────
    statusItems() {
      const fixed = [
        {
          key: '__config',
          label: this.$t('ConfigFile'),
          value: this.configLoaded ? this.$t('Loaded') : this.$t('NotLoaded'),
          tag: this.configLoaded ? 'success' : 'warning'
        },
        {
          key: '__sdk',
          label: this.$t('SdkStatus'),
          value: this.sdkLoaded ? this.$t('Loaded') : this.$t('NotLoaded'),
          tag: this.sdkLoaded ? 'success' : 'warning'
        }
      ]
      const dynamic = this.deviceInfoItems.filter(
        (item) => this.mode === 'admin' || (item.scope || 'both') !== 'admin'
      )
      if (!this.infoWhenPassed) return fixed
      return [...fixed, ...dynamic]
    },

    // ── 根据 scope / hidden 过滤后的操作按钮 ────────────────────────────────────
    visibleOperations() {
      if (!this.sdkConfig) return []
      const operationItems = this.operationsConfig.items
      if (!Array.isArray(operationItems) || operationItems.length === 0) return []
      if (!this.operationWhenPassed) return []
      // 引用 ukeySnapshot 使 computed 在 _ukey 变化时自动重算
      const ukey = this.ukeySnapshot
      const ctx = {
        ukey,
        vars: {},
        input: {},
        mode: this.mode,
        user: this.object || {},
        settings: this.publicSettings || {},
        config: this.config
      }
      return operationItems
        .filter((op) => {
          const scope = op.scope || 'both'
          if (scope === 'admin' && this.mode !== 'admin') return false
          if (scope === 'user' && this.mode !== 'user') return false
          if (!this.evaluateWhen(op.when, ctx)) return false
          // hidden 支持布尔值或 {{ }} 模板（解析结果为真值时隐藏）
          if (op.hidden !== undefined) {
            const resolved = this.resolveValue(op.hidden, ctx)
            if (resolved === true || resolved === 'true' || resolved === 1) return false
          }
          return true
        })
        .map((op) => {
          // disabled 支持布尔值或 {{ }} 模板（解析结果为真值时禁用）
          let opDisabled = false
          if (op.disabled !== undefined) {
            const resolved = this.resolveValue(op.disabled, ctx)
            opDisabled = !!resolved
          }
          return { ...op, _disabled: opDisabled }
        })
    },

    deviceReady() {
      return this.sdkLoaded
    }
  },

  async mounted() {
    this.pollTimer = null // 非响应式，直接挂实例
    await this.loadConfig()
    this.loadSDKScript()
  },

  beforeUnmount() {
    if (this.pollTimer) clearInterval(this.pollTimer)
  },

  methods: {
    syncUkeySnapshot() {
      this.ukeySnapshot = Object.assign({}, _ukey)
    },

    syncWhenGateLogs() {
      if (!this.infoWhenPassed) {
        if (!this.infoWhenFalseLogged) {
          this.appendLog(this.$t('InfoHiddenWhenMismatch'), 'warn')
          this.infoWhenFalseLogged = true
        }
      } else {
        this.infoWhenFalseLogged = false
      }

      if (!this.operationWhenPassed) {
        if (!this.operationWhenFalseLogged) {
          this.appendLog(this.$t('OperationUnavailableWhenMismatch'), 'warn')
          this.operationWhenFalseLogged = true
        }
      } else {
        this.operationWhenFalseLogged = false
      }
    },

    evaluateWhen(whenExpr, customCtx = null) {
      if (whenExpr === undefined) return true
      if (typeof whenExpr === 'boolean') return whenExpr

      const ctx = customCtx || this.buildContext({ vars: {}, input: {} })
      const resolved = this.resolveValue(whenExpr, ctx)

      if (resolved === false || resolved === 'false' || resolved === 0 || resolved === '0') {
        return false
      }
      if (resolved == null) return false
      if (typeof resolved === 'string' && resolved.trim() === '') return false
      return true
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. 配置加载
    // ═══════════════════════════════════════════════════════════════════════════
    async loadConfig() {
      try {
        this.sdkConfig = await this.$axios.get(CONFIG_API)
        this.config = this.sdkConfig.config || {}
        this.configLoaded = true
        this.appendLog(this.$t('ConfigLoadedSuccess'), 'success')
      } catch (e) {
        this.appendLog(`${this.$t('ConfigLoadedFailed')}: ${e.message}`, 'error')
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. 驱动脚本注入
    // ═══════════════════════════════════════════════════════════════════════════
    loadSDKScript() {
      if (!this.sdkConfig) return

      if (document.getElementById(SCRIPT_TAG_ID)) {
        // 脚本已注入（页面复用），直接初始化实例
        this.initSDKInstance()
        return
      }

      const sdkUrl = this.config.api?.ukey_sdk_script_url
      if (!sdkUrl) {
        this.appendLog(this.$t('MissingUkeySdkScriptUrl'), 'error')
        return
      }
      const script = document.createElement('script')
      script.id = SCRIPT_TAG_ID
      script.src = sdkUrl
      script.async = true
      script.onload = () => this.initSDKInstance()
      script.onerror = () => {
        this.appendLog(this.$t('SdkScriptLoadFailed'), 'error')
      }
      document.body.appendChild(script)
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. UKey 实例创建 + setup 步骤执行
    // ═══════════════════════════════════════════════════════════════════════════
    async initSDKInstance() {
      // 3a. 创建实例
      try {
        const constructorName = this.sdkConfig.sdk?.create?.constructor
        if (!constructorName || !window[constructorName]) {
          throw new Error(
            `${this.$t('Constructor')} "${constructorName}" ${this.$t('NotFoundOnWindow')}`
          )
        }
        const ctorArgs = this.sdkConfig.sdk.create?.args || []
        _instance = new window[constructorName](...ctorArgs)
        _ukey = {}
        _userOverride = null
        this.sdkLoaded = true
        this.appendLog(`${this.$t('DriverInstanceCreated')} (${constructorName})`, 'success')
      } catch (e) {
        this.appendLog(`${this.$t('DriverInstanceCreateFailed')}: ${e.message}`, 'error')
        return
      }

      // 3b. 执行 setup 步骤（各厂商按需配置，结果可注册到 ukey.* 供后续使用）
      try {
        const setupSteps = this.sdkConfig.sdk?.setup?.steps || []
        for (const step of setupSteps) {
          const ctx = this.buildContext({ vars: {}, input: {} })
          const result = this.callUKeyMethod(step, ctx)
          if (step.register) this.applyRegister(step.register, result, {})
          this.appendLog(
            `${this.$t('Initialize')}: ${step.label || step.name || step.call} ${this.$t('Success')}`,
            'success'
          )
        }
      } catch (e) {
        this.appendLog(`${this.$t('DeviceInitFailed')}: ${e.message}`, 'error')
        _ukey = {}
        this.syncUkeySnapshot()
      }

      // 3c. 读取设备信息和证书信息（无论 setup 是否成功都执行）
      await this.readDeviceInfo()
      await this.readCertInfo()

      // 3d. 启动轮询，定时刷新设备状态和证书信息
      const interval = this.config.poll_interval || 5000
      if (interval > 0) {
        this.pollTimer = setInterval(() => this.pollStatus(), interval)
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. 设备信息读取（填充左上动态行）
    // ═══════════════════════════════════════════════════════════════════════════
    async readDeviceInfo() {
      if (!this.infoWhenPassed) {
        this.deviceInfoItems = []
        this.syncUkeySnapshot()
        this.syncWhenGateLogs()
        return
      }
      const fields = this.sdkConfig?.info?.device || []
      const ctx = this.buildContext({ vars: {}, input: {} })
      this.deviceInfoItems = fields
        .map((field) => {
          // hidden 支持布尔值或 {{ }} 模板，为真时跳过该字段
          if (field.hidden !== undefined) {
            const resolved = this.resolveValue(field.hidden, ctx)
            if (resolved) return null
          }
          const raw = this.resolveFieldValue(field, ctx)
          const value = raw == null ? '-' : raw
          const item = { key: field.key, label: field.label, value, scope: field.scope || 'both' }

          // status.cases：通过 source 表达式的值匹配 case，决定显示文本和标签颜色
          if (field.status && Array.isArray(field.status.cases)) {
            const sourceVal =
              field.source !== undefined ? this.resolveValue(field.source, ctx) : raw
            const matchedIndex = field.status.cases.findIndex((c) => {
              if (c.match === 'truthy') return !!sourceVal
              if (c.match === 'falsy') return !sourceVal
              return String(sourceVal) === String(c.match)
            })
            const matched = matchedIndex !== -1 ? field.status.cases[matchedIndex] : null
            if (matched) {
              item.value = matched.text || value
              if (matched.type) item.tag = matched.type
            }
            // register：将匹配 case 的 value 写入指定路径
            if (field.register && matched && 'value' in matched) {
              this.applyRegister(field.register, matched.value, {})
            }
          } else if (field.compare !== undefined) {
            const match = this.resolveCompare(field.compare, raw, ctx)
            if (match !== null) {
              item.tag = match === false ? 'danger' : 'success'
            }
          }
          return item
        })
        .filter((item) => item !== null)
      // 同步响应式镜像，触发 visibleOperations 重算
      this.syncUkeySnapshot()
      this.syncWhenGateLogs()
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. 轮询：定时刷新设备状态与证书信息
    // ═══════════════════════════════════════════════════════════════════════════
    async pollStatus() {
      if (this.running) return // 操作进行中，跳过本次轮询
      try {
        // 重新执行 setup 步骤检测设备是否仍然在线
        const setupSteps = this.sdkConfig?.sdk?.setup?.steps || []
        for (const step of setupSteps) {
          const ctx = this.buildContext({ vars: {}, input: {} })
          const result = this.callUKeyMethod(step, ctx)
          if (step.register) this.applyRegister(step.register, result, {})
        }
      } catch (_) {
        _ukey = {}
        this.syncUkeySnapshot()
      }
      await this.readDeviceInfo()
      await this.readCertInfo()
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. 证书信息读取（填充右上）
    //    支持两种模式：
    //    - per-field：config.info.cert 为数组，每个字段独立 call / value
    //    - batch：config.info.cert 为对象 { fetch, fields }，先统一调用一次
    //             fetch 结果注入 cert.* 命名空间，字段用 {{ cert.xxx }} 引用
    // ═══════════════════════════════════════════════════════════════════════════
    async readCertInfo() {
      if (!this.infoWhenPassed) {
        this.certInfoItems = []
        this.hasCert = false
        this.certLoading = false
        this.syncWhenGateLogs()
        return
      }
      const certConfig = this.sdkConfig && this.sdkConfig.info && this.sdkConfig.info.cert
      // 兼容数组（旧格式）和对象（新格式 { check?, fields }）
      const fields = Array.isArray(certConfig)
        ? certConfig
        : (certConfig && certConfig.fields) || []
      const certCheck = Array.isArray(certConfig) ? undefined : certConfig && certConfig.when

      const ctx = this.buildContext({ vars: {}, input: {} })

      // cert 级别 check 钩子：false → hasCert = false，显示「暂未签发证书」
      if (certCheck !== undefined) {
        let passed = false
        try {
          if (certCheck && typeof certCheck === 'object' && certCheck.call) {
            // call + 可选 expr
            const result = this.callUKeyMethod(certCheck, ctx)
            if (certCheck.expr) {
              passed = !!this.resolveValue(
                certCheck.expr,
                Object.assign({}, ctx, { result: result })
              )
            } else {
              passed = result != null
            }
          } else {
            // 字符串表达式
            passed = !!this.resolveValue(certCheck, ctx)
          }
        } catch (_) {
          passed = false
        }
        if (!passed) {
          this.certInfoItems = []
          this.hasCert = false
          this.certLoading = false
          return
        }
      }

      if (!fields.length) {
        this.certInfoItems = []
        this.hasCert = false
        this.certLoading = false
        return
      }

      let hasAny = false

      const items = fields.map((field) => {
        const rawVal = this.resolveFieldValue(field, ctx)

        const item = {
          key: field.key,
          label: field.label,
          value: rawVal == null ? '-' : String(rawVal)
        }

        if (rawVal != null) {
          hasAny = true
          if (field.compare !== undefined) {
            const match = this.resolveCompare(field.compare, rawVal, ctx)
            item.tag = match === null || match ? 'success' : 'danger'
          }
        }

        return item
      })

      this.certInfoItems = items
      this.hasCert = hasAny
      this.certLoading = false
      this.syncWhenGateLogs()
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. 操作按钮处理入口
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * 执行 op.event 声明的刷新事件
     * 支持字符串或数组：'refresh.info.cert' / ['refresh.info.device', 'refresh.info.cert']
     * 无 event 配置时默认刷新 cert
     */
    async handleEvents(event) {
      const events =
        event === undefined
          ? ['refresh.info.cert']
          : event == null
            ? []
            : Array.isArray(event)
              ? event
              : [event]
      for (const e of events) {
        if (e === 'refresh.info.device') await this.readDeviceInfo()
        else if (e === 'refresh.info.cert') await this.readCertInfo()
      }
    },
    async handleOperation(op) {
      // 操作前全局确认（op.confirm 配置）
      if (op.confirm) {
        try {
          await this.$confirm(
            op.confirm.message || this.$t('ConfirmExecuteOperation'),
            op.confirm.title || this.$t('OperationConfirm'),
            {
              type: op.confirm.type || 'warning',
              confirmButtonText: this.$t('Confirm'),
              cancelButtonText: this.$t('Cancel')
            }
          )
        } catch (_) {
          return
        }
      }

      this.running = true
      this.currentOperation = op.key
      try {
        const operationVars = {} // vars.* 命名空间，仅当前操作可见
        const collectedInput = {} // input.* 命名空间，跨步骤累积
        for (const step of op.steps || []) {
          await this.executeStep(step, operationVars, collectedInput)
        }
        this.appendLog(`${this.$t('Operation')}「${op.label}」${this.$t('Completed')}`, 'success')
        await this.handleEvents(op.event)
      } catch (e) {
        this.appendLog(
          `${this.$t('Operation')}「${op.label}」${this.$t('Failed')}: ${e.message}`,
          'error'
        )
      } finally {
        this.running = false
        this.currentOperation = ''
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. 单步执行器
    // ═══════════════════════════════════════════════════════════════════════════
    async executeStep(step, operationVars, collectedInput = {}) {
      // 7a. 若步骤声明了 input，先弹对话框收集用户输入
      if (step.input) {
        try {
          const inputCtx = this.buildContext({ vars: operationVars, input: collectedInput })
          const newInput = await this.showInputDialog(
            step.input.fields || [],
            step.input.title || step.label || this.$t('PleaseInput'),
            inputCtx
          )
          Object.assign(collectedInput, newInput)
        } catch (_) {
          throw new Error(this.$t('OperationCanceled'))
        }
      }

      const ctx = this.buildContext({ vars: operationVars, input: collectedInput })
      let result

      try {
        if (step.type === 'api') {
          result = await this.executeApiStep(step, ctx)
        } else {
          result = this.callUKeyMethod(step, ctx)
        }

        // 7b. 返回值校验（check 配置）
        if (step.check !== undefined) {
          const checkExpr = typeof step.check === 'string' ? step.check : step.check?.expr
          const checkMsg = step.check?.message
          if (checkExpr) {
            // 将 result 注入上下文，供表达式引用
            const checkCtx = { ...ctx, result }
            const passed = this.resolveValue(checkExpr, checkCtx)
            if (!passed && passed !== undefined) {
              const errMsg = checkMsg
                ? String(this.resolveValue(checkMsg, checkCtx) || checkMsg)
                : `${this.$t('ReturnValidationFailed')}（${checkExpr}），${this.$t('ActualReturned')}: ${JSON.stringify(result)}`
              throw new Error(errMsg)
            }
          }
        }

        const stepLabel = step.label || step.name || step.call || this.$t('Step')
        this.appendLog(`${stepLabel} ${this.$t('Success')}`, 'success')
      } catch (e) {
        const stepLabel = step.label || step.name || step.call || this.$t('Step')
        const msg = `${stepLabel} ${this.$t('Failed')}: ${e.message || e}`
        if (step.on_error === 'skip') {
          this.appendLog(`${msg}（${this.$t('Skipped')}）`, 'warn')
          return
        }
        this.appendLog(msg, 'error')
        throw new Error(msg)
      }

      // 7b. 将返回值注册到对应命名空间
      if (step.register && result !== undefined) {
        this.applyRegister(step.register, result, operationVars)
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. API 步骤（type: api）
    // ═══════════════════════════════════════════════════════════════════════════
    async executeApiStep(step, ctx) {
      const method = (step.method || 'post').toLowerCase()
      const apiConfig =
        (this.config && typeof this.config.api === 'object' && this.config.api) || {}
      const stepUrlTpl = step && step.url
      const apiKeyMatch =
        typeof stepUrlTpl === 'string' ? stepUrlTpl.match(/config\.api\.([A-Za-z0-9_]+)/) : null
      const apiKey = apiKeyMatch ? apiKeyMatch[1] : ''
      let url = apiKey ? apiConfig[apiKey] : ''

      // URL 仅允许从 config.api.xxx 的 xxx 获取
      if (typeof url !== 'string' || !url) {
        throw new Error(
          `API key "${apiKey || stepUrlTpl}" ${this.$t('ApiNotConfiguredUnsupported')}`
        )
      }

      // method 仅允许从 api_method[apiKey] 中读取
      const apiMethodConfig =
        (this.config && typeof this.config.api_method === 'object' && this.config.api_method) || {}
      const allowedMethods = apiKey ? apiMethodConfig[apiKey] : undefined
      if (!Array.isArray(allowedMethods) || allowedMethods.length === 0) {
        throw new Error(`API key "${apiKey}" ${this.$t('ApiMethodNotDefinedUnsupported')}`)
      }
      const normalizedAllowedMethods = allowedMethods
        .map((m) =>
          String(m || '')
            .trim()
            .toUpperCase()
        )
        .filter(Boolean)
      const requestMethod = method.toUpperCase()
      if (!normalizedAllowedMethods.includes(requestMethod)) {
        throw new Error(
          `API key "${apiKey}" ${this.$t('MethodNotAllowed')} ${requestMethod} ${this.$t('MethodOnlyAllowed')} ${normalizedAllowedMethods.join(', ')} ${this.$t('Method')}`
        )
      }

      // url_format: 将 {key} 占位符替换为解析后的值
      if (step.url_format && typeof url === 'string') {
        const formatParams = this.resolveObjectValues(step.url_format, ctx)
        url = url.replace(/\{(\w+)\}/g, (_, key) => {
          return key in formatParams ? encodeURIComponent(formatParams[key]) : `{${key}}`
        })
      }

      let body = step.body ? this.resolveObjectValues(step.body, ctx) : undefined
      const params = step.params ? this.resolveObjectValues(step.params, ctx) : undefined
      const axiosConfig = params ? { params } : undefined

      // === 只保留允许的 body 字段（仅按 config.api.xxx 的 xxx 匹配）===
      if (body && this.config.api_body && typeof this.config.api_body === 'object') {
        const allowedFields = apiKey ? this.config.api_body[apiKey] : undefined

        // api_body 未配置该 URL（或字段列表为空）时，不限制 body
        if (Array.isArray(allowedFields) && allowedFields.length > 0) {
          body = Object.fromEntries(Object.entries(body).filter(([k]) => allowedFields.includes(k)))
        }
      }

      // GET/DELETE: (url, config)；其他方法: (url, body, config)
      if (method === 'get' || method === 'delete') {
        return await this.$axios[method](url, axiosConfig)
      }
      return await this.$axios[method](url, body, axiosConfig)
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 9. UKey 方法调用
    // ═══════════════════════════════════════════════════════════════════════════
    callUKeyMethod(step, ctx) {
      if (!step.call) return undefined
      if (!_instance || typeof _instance[step.call] !== 'function') {
        throw new Error(`UKey ${this.$t('Method')} "${step.call}" ${this.$t('NotExist')}`)
      }
      const args = this.resolveArgs(step.args || [], ctx)
      return _instance[step.call](...args)
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 10. 变量解析工具
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * 解析 compare 配置，返回比对结果：true / false / null（无法比对）
     * 支持：
     *   compare: "{{ ukey.devSN }}"          → fieldValue vs 解析值
     *   compare: { key1: "...", key2: "..." } → key1 vs key2
     */
    resolveCompare(compare, fieldValue, ctx) {
      if (!fieldValue) return null

      const normalize = (v) => {
        const r = Array.isArray(v) && v.length === 1 ? v[0] : v
        return r == null ? null : String(r)
      }
      let v1, v2
      if (compare && typeof compare === 'object') {
        v1 = normalize(this.resolveValue(compare.key1, ctx))
        v2 = normalize(this.resolveValue(compare.key2, ctx))
      } else {
        v1 = normalize(fieldValue)
        v2 = normalize(this.resolveValue(compare, ctx))
      }
      return v1 != null && v2 != null ? v1 === v2 : null
    },

    /**
     * 读取一个 info 字段的值，优先级：call > value（支持模板）
     * 任何错误均静默返回 null
     */
    resolveFieldValue(field, ctx) {
      if (field.call) {
        let result
        try {
          result = this.callUKeyMethod(field, ctx)
        } catch (_) {
          return null
        }
        // 调用成功后对返回值做校验（check 配置），未通过则不显示该字段
        if (field.check !== undefined) {
          const checkExpr =
            typeof field.check === 'string' ? field.check : field.check && field.check.expr
          if (checkExpr) {
            const checkCtx = Object.assign({}, ctx, { result: result })
            const passed = this.resolveValue(checkExpr, checkCtx)
            if (!passed && passed !== undefined) return null
          }
        }
        return result
      }
      if ('value' in field) {
        return this.resolveValue(field.value, ctx)
      }
      return null
    },

    /** 构建上下文对象，供模板解析使用 */
    buildContext({ vars = {}, input = {} }) {
      const ukey =
        _ukey && typeof _ukey === 'object' && Object.keys(_ukey).length > 0
          ? _ukey
          : this.ukeySnapshot || {}
      return {
        ukey,
        instance: _instance,
        vars,
        input,
        mode: this.mode,
        user: _userOverride || this.object || {},
        settings: this.publicSettings || {},
        config: this.config
      }
    },

    /**
     * 解析单个模板值：
     *   - 整体为 {{ expr }}  → 求值后返回（保留原始类型，如数字/布尔）
     *   - 包含多个 {{ }}     → 字符串插值，所有片段替换后拼接返回字符串
     *   - 无 {{ }}           → 原样返回
     */
    resolveValue(tpl, ctx) {
      if (typeof tpl !== 'string') return tpl

      const nsMap = {
        ukey: ctx.ukey,
        instance: ctx.instance,
        vars: ctx.vars,
        input: ctx.input,
        user: ctx.user,
        settings: ctx.settings,
        config: ctx.config,
        // 透传 ctx 中的其他临时变量（如 result）
        ...Object.fromEntries(
          Object.entries(ctx).filter(
            ([k]) =>
              !['ukey', 'instance', 'vars', 'input', 'user', 'settings', 'config'].includes(k)
          )
        )
      }

      const evalExpr = (expr) => {
        const e = expr.trim()
        // 纯路径快速路径
        if (/^[\w.]+$/.test(e)) {
          const parts = e.split('.')
          const ns = parts[0]
          if (!(ns in nsMap)) return undefined
          let val = nsMap[ns]
          for (const p of parts.slice(1)) {
            if (val == null) return undefined
            val = val[p]
          }
          return val
        }
        // 表达式求值
        try {
          // 兼容配置里常见的路径写法：ukey.devSN.0 -> ukey.devSN[0]
          const normalizedExpr = e.replace(/\.([0-9]+)(?=\b)/g, '[$1]')
          const keys = Object.keys(nsMap)
          const vals = keys.map((k) => nsMap[k])
          // eslint-disable-next-line no-new-func
          return new Function(...keys, `return (${normalizedExpr})`)(...vals)
        } catch (_) {
          return undefined
        }
      }

      // 整体是单个 {{ expr }}：保留原始类型
      const singleMatch = tpl.match(/^\{\{\s*([\s\S]+?)\s*\}\}$/)
      if (singleMatch) return evalExpr(singleMatch[1])

      // 含有至少一个 {{ }}：字符串插值
      if (/\{\{/.test(tpl)) {
        return tpl.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, (_, expr) => {
          const val = evalExpr(expr)
          return val == null ? '' : String(val)
        })
      }

      // 纯文本
      return tpl
    },

    /**
     * 解析参数列表
     * 支持：字符串模板、复杂对象参数 { type: 'csv'|'json', value: {...} }
     */
    resolveArgs(argsDef, ctx) {
      return argsDef.map((arg) => {
        if (arg == null || typeof arg !== 'object') {
          return this.resolveValue(arg, ctx)
        }
        // 复杂参数：将 value dict 各字段解析后格式化为字符串
        if (arg.type === 'csv' || arg.type === 'json') {
          const resolved = {}
          for (const [k, v] of Object.entries(arg.value || {})) {
            resolved[k] = this.resolveValue(v, ctx)
          }
          if (arg.type === 'csv') {
            return Object.entries(resolved)
              .map(([k, v]) => `${k}=${v}`)
              .join(',')
          }
          return JSON.stringify(resolved)
        }
        // 普通对象：递归解析所有值
        return this.resolveObjectValues(arg, ctx)
      })
    },

    /** 递归解析对象（或数组）中所有字符串模板值 */
    resolveObjectValues(obj, ctx) {
      if (obj == null || typeof obj !== 'object') return this.resolveValue(obj, ctx)
      if (Array.isArray(obj)) return obj.map((i) => this.resolveObjectValues(i, ctx))
      const result = {}
      for (const [k, v] of Object.entries(obj)) {
        result[k] = this.resolveObjectValues(v, ctx)
      }
      return result
    },

    /**
     * 将步骤返回值写入 ukey.* 或 vars.* 命名空间
     * register 格式：ukey.appHandle  /  vars.certData  /  vars.certData.certificate
     */
    applyRegister(register, value, operationVars) {
      const dot = register.indexOf('.')
      // 无点号：整体替换命名空间
      if (dot === -1) {
        if (register === 'ukey') {
          _ukey = value && typeof value === 'object' ? value : {}
          this.syncUkeySnapshot()
        } else if (register === 'user') {
          _userOverride = value && typeof value === 'object' ? value : {}
        }
        return
      }
      const ns = register.substring(0, dot)
      const key = register.substring(dot + 1)
      let target
      if (ns === 'ukey') {
        target = _ukey
      } else if (ns === 'vars') {
        target = operationVars
      } else if (ns === 'user') {
        // 确保有可写对象（不直接修改 prop）
        if (!_userOverride) _userOverride = Object.assign({}, this.object || {})
        target = _userOverride
      } else {
        return
      }
      this.setNestedPath(target, key, value)
      if (ns === 'ukey') this.syncUkeySnapshot()
    },

    setNestedPath(obj, path, value) {
      const parts = path.split('.')
      let cur = obj
      for (let i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {}
        cur = cur[parts[i]]
      }
      cur[parts[parts.length - 1]] = value
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 11. 通用输入弹框
    // ═══════════════════════════════════════════════════════════════════════════
    getInputDialogLabelWidth(fields) {
      const maxWeightedLen = (fields || []).reduce((max, f) => {
        const text = String((f && f.label) || '')
        const weightedLen = Array.from(text).reduce((sum, ch) => {
          return sum + (/[^\x00-\xff]/.test(ch) ? 2 : 1)
        }, 0)
        return Math.max(max, weightedLen)
      }, 0)
      const width = Math.min(240, Math.max(88, maxWeightedLen * 8 + 20))
      return `${width}px`
    },

    showInputDialog(fields, title, ctx = {}) {
      return new Promise((resolve, reject) => {
        const form = {}
        fields.forEach((f) => {
          const defaultVal = f.value !== undefined ? this.resolveValue(f.value, ctx) : ''
          form[f.key] = defaultVal == null ? '' : String(defaultVal)
        })
        this.inputDialog = {
          visible: true,
          title,
          fields,
          labelWidth: this.getInputDialogLabelWidth(fields),
          form,
          error: '',
          _resolve: resolve,
          _reject: reject
        }
      })
    },

    confirmInputDialog() {
      // 校验各字段
      for (const f of this.inputDialog.fields) {
        if (!f.validate) continue
        const val = this.inputDialog.form[f.key]
        if (f.validate.minLength !== undefined) {
          const minLength = Number(f.validate.minLength)
          if (!Number.isNaN(minLength) && String(val || '').length < minLength) {
            this.inputDialog.error =
              f.validate.message || `「${f.label}」${this.$t('Length')} < ${minLength}`
            return
          }
        }
        if (f.validate.maxLength !== undefined) {
          const maxLength = Number(f.validate.maxLength)
          if (!Number.isNaN(maxLength) && String(val || '').length > maxLength) {
            this.inputDialog.error =
              f.validate.message || `「${f.label}」${this.$t('Length')} > ${maxLength}`
            return
          }
        }
        if (f.validate.equals !== undefined) {
          const target = this.inputDialog.form[f.validate.equals]
          if (val !== target) {
            this.inputDialog.error =
              f.validate.message ||
              `「${f.label}」${this.$t('And')}「${f.validate.equals}」${this.$t('NotMatch')}`
            return
          }
        }
      }
      this.inputDialog.error = ''
      this.inputDialog.visible = false
      this.inputDialog._resolve({ ...this.inputDialog.form })
    },

    cancelInputDialog() {
      this.inputDialog.visible = false
      this.inputDialog._reject(new Error('cancelled'))
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 12. 日志
    // ═══════════════════════════════════════════════════════════════════════════
    appendLog(message, level = 'info') {
      const time = new Date().toLocaleTimeString()
      this.logs.push({ time, message, level })
      this.$nextTick(() => {
        if (this.$refs.logBox) this.$refs.logBox.scrollTop = this.$refs.logBox.scrollHeight
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// ── 信息展示表格（左上状态 / 右上证书）─────────────────────────────────────────
.cp-info-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 8px 0;
    font-size: 13px;
    vertical-align: middle;
  }

  .cp-label {
    color: #909399;
    white-space: nowrap;
    padding-right: 12px;
  }

  .cp-value {
    text-align: right;
    max-width: 200px;
  }

  .cp-text {
    color: #303133;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    cursor: default;
  }
}

// ── 证书空状态 ──────────────────────────────────────────────────────────────────
.cp-cert-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

// ── 证书加载中 ──────────────────────────────────────────────────────────────────
.cp-cert-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
  justify-content: center;
  color: #909399;
  font-size: 13px;

  .el-icon-loading {
    font-size: 16px;
  }
}

// ── 操作按钮表格（左中）─────────────────────────────────────────────────────────
.cp-action-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 10px 0;
    vertical-align: middle;
  }

  .cp-action-desc {
    padding-right: 12px;

    .cp-action-title {
      font-size: 13px;
      color: #303133;
      line-height: 1.4;
    }
    .cp-action-hint {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
      line-height: 1.4;
    }
  }

  .cp-action-btn {
    width: 72px;
    text-align: right;
    white-space: nowrap;

    :deep(.el-button) {
      width: 100%;
    }
  }
}

// ── 操作日志（左下）──────────────────────────────────────────────────────────────
.cp-logs-box {
  background: #1e1e1e;
  border-radius: 4px;
  padding: 10px 14px;
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
}

.cp-log-item {
  line-height: 1.8;
  display: flex;
  gap: 10px;

  .cp-log-time {
    color: #6a9955;
    flex-shrink: 0;
  }
  .cp-log-msg {
    color: #d4d4d4;
  }

  &.cp-log-success .cp-log-msg {
    color: #4ec9b0;
  }
  &.cp-log-error .cp-log-msg {
    color: #f48771;
  }
  &.cp-log-warn .cp-log-msg {
    color: #dcdcaa;
  }
}
</style>

<style lang="scss">
// ── 输入弹框（custom-class 不受 scoped 限制）────────────────────────────────────
.cp-input-dialog {
  .el-dialog__body {
    padding: 16px 20px 8px;
  }
  .el-dialog__footer {
    padding: 8px 20px 16px;
  }
}

.cp-input-form {
  .el-form-item {
    margin-bottom: 14px;
  }

  // 英文标签更长，固定单行避免中间断行
  .el-form-item__label {
    white-space: nowrap;
    word-break: keep-all;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 14px;
  }
}

@media (max-width: 640px) {
  .cp-input-form {
    // 小屏改为上下布局，避免横向空间不足导致标签可读性下降
    .el-form-item__label {
      float: none;
      display: block;
      width: 100% !important;
      text-align: left;
      line-height: 1.4;
      padding: 0 0 6px;
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
    }

    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
</style>
