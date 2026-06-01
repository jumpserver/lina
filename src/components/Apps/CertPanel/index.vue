<template>
  <div>
    <TwoCol>
      <template>
        <!-- 左上：设备驱动状态 -->
        <IBox title="设备驱动状态">
          <table class="cp-info-table">
            <tbody>
              <tr v-for="item in statusItems" :key="item.key">
                <td class="cp-label">{{ item.label }}</td>
                <td class="cp-value">
                  <el-tag v-if="item.tag !== undefined" :type="item.tag" size="mini" effect="plain">
                    {{ item.value }}
                  </el-tag>
                  <span v-else class="cp-text">{{ item.value || '--' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </IBox>

        <!-- 左中：操作按钮 -->
        <IBox title="操作" style="margin-top: 10px">
          <table v-if="visibleOperations.length > 0" class="cp-action-table">
            <tbody>
              <tr v-for="op in visibleOperations" :key="op.key">
                <td class="cp-action-desc">
                  <div class="cp-action-title">{{ op.label }}</div>
                  <div v-if="op.hint" class="cp-action-hint">{{ op.hint }}</div>
                </td>
                <td class="cp-action-btn">
                  <el-button
                    :type="op.btnType || 'primary'"
                    :disabled="!deviceReady || running"
                    :loading="running && currentOperation === op.key"
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
            暂无可用操作
          </div>
        </IBox>

        <!-- 左下：操作日志 -->
        <IBox v-if="logs.length > 0" title="操作日志" style="margin-top: 10px">
          <div ref="logBox" class="cp-logs-box">
            <div
              v-for="(log, i) in logs"
              :key="i"
              :class="['cp-log-item', `cp-log-${log.level}`]"
            >
              <span class="cp-log-time">{{ log.time }}</span>
              <span class="cp-log-msg">{{ log.message }}</span>
            </div>
          </div>
        </IBox>
      </template>

      <template #right>
        <!-- 右上：证书信息 -->
        <IBox title="证书信息">
          <div v-if="certLoading" class="cp-cert-loading">
            <i class="el-icon-loading" />
            <span>加载中…</span>
          </div>
          <table v-else-if="hasCert" class="cp-info-table">
            <tbody>
              <tr v-for="item in certInfoItems" :key="item.key">
                <td class="cp-label">{{ item.label }}</td>
                <td class="cp-value">
                  <el-tag v-if="item.tag !== undefined" :type="item.tag" size="mini" effect="plain" :title="item.value">
                    {{ item.value }}
                  </el-tag>
                  <span v-else class="cp-text" :title="item.value">{{ item.value || '--' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <el-empty v-else description="暂未签发证书" :image-size="80" />
        </IBox>
      </template>
    </TwoCol>

    <!-- 通用输入弹框（步骤内 input 配置驱动） -->
    <el-dialog
      :title="inputDialog.title"
      :visible.sync="inputDialog.visible"
      :before-close="cancelInputDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="380px"
      :lock-scroll="false"
      append-to-body
    >
      <el-form label-width="100px">
        <el-form-item
          v-for="f in inputDialog.fields"
          :key="f.key"
          :label="f.label"
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
          style="margin-top: 8px"
        />
      </el-form>
      <span slot="footer">
        <el-button @click="cancelInputDialog">取 消</el-button>
        <el-button type="primary" @click="confirmInputDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import IBox from '@/components/Common/IBox'

const CONFIG_API = '/api/v1/authentication/cert/vendor-driver-config/'
const DRIVER_SCRIPT_URL = '/api/v1/authentication/cert/vendor-driver.js/'
const SCRIPT_TAG_ID = 'cert-vendor-driver-sdk'

// 模块级单例 — 防止 Vue 响应式代理污染第三方 SDK 对象
let _instance = null // UKey SDK 实例
let _ukey = {} // ukey.* 命名空间（driver.setup.steps register 的变量）

export default {
  name: 'CertPanel',
  components: { TwoCol, IBox },

  props: {
    /** 'admin': 管理员管理他人证书；'user': 用户自管理 */
    mode: {
      type: String,
      default: 'user',
      validator: v => ['admin', 'user'].includes(v)
    },
    /** 被管理的用户对象（admin 模式必传） */
    object: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      config: null,
      configLoaded: false,
      driverLoaded: false,
      driverLoadError: false,
      deviceConnected: false,

      deviceInfoItems: [], // [{ key, label, value, scope }]
      certInfoItems: [], // [{ key, label, value, tag? }]
      certLoading: true,
      hasCert: false,

      running: false,
      currentOperation: '',
      logs: [],

      inputDialog: {
        visible: false,
        title: '',
        fields: [],
        form: {},
        error: '',
        _resolve: null,
        _reject: null
      }
    }
  },

  computed: {
    ...mapGetters(['publicSettings']),

    // ── 左上状态面板：固定行 + config.info.device 动态行 ──────────────────────────
    statusItems() {
      const fixed = [
        {
          key: '__config',
          label: '配置文件',
          value: this.configLoaded ? '已加载' : '未加载',
          tag: this.configLoaded ? 'success' : 'warning'
        },
        {
          key: '__driver',
          label: '驱动状态',
          value: this.driverLoadError ? '加载失败' : this.driverLoaded ? '已就绪' : '加载中...',
          tag: this.driverLoadError ? 'danger' : this.driverLoaded ? 'success' : 'info'
        },
        {
          key: '__device',
          label: 'UKey',
          value: this.deviceConnected ? '已连接' : '未连接',
          tag: this.deviceConnected ? 'success' : 'warning'
        }
      ]
      const dynamic = this.deviceInfoItems.filter(item =>
        this.mode === 'admin' || (item.scope || 'both') !== 'admin'
      )
      return [...fixed, ...dynamic]
    },

    // ── 根据 scope / hidden 过滤后的操作按钮 ────────────────────────────────────
    visibleOperations() {
      if (!this.config || !Array.isArray(this.config.operations)) return []
      const ctx = {
        ukey: _ukey,
        vars: {},
        input: {},
        user: this.object || {},
        settings: this.publicSettings || {},
        config: this.config?.config || {}
      }
      return this.config.operations.filter(op => {
        const scope = op.scope || 'both'
        if (scope === 'admin' && this.mode !== 'admin') return false
        if (scope === 'user' && this.mode !== 'user') return false
        // hidden 支持布尔值或 {{ }} 模板（解析结果为真值时隐藏）
        if (op.hidden !== undefined) {
          const resolved = this.resolveValue(op.hidden, ctx)
          if (resolved === true || resolved === 'true' || resolved === 1) return false
        }
        return true
      })
    },

    deviceReady() {
      return this.driverLoaded && this.deviceConnected
    }
  },

  async mounted() {
    await this.loadConfig()
    this.loadDriverScript()
  },

  methods: {
    // ═══════════════════════════════════════════════════════════════════════════
    // 1. 配置加载
    // ═══════════════════════════════════════════════════════════════════════════
    async loadConfig() {
      try {
        this.config = await this.$axios.get(CONFIG_API)
        this.configLoaded = true
        this.appendLog('配置文件加载成功', 'success')
      } catch (e) {
        this.appendLog(`配置文件加载失败: ${e.message}`, 'error')
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. 驱动脚本注入
    // ═══════════════════════════════════════════════════════════════════════════
    loadDriverScript() {
      if (!this.config) return

      if (document.getElementById(SCRIPT_TAG_ID)) {
        // 脚本已注入（页面复用），直接初始化实例
        this.initDriverInstance()
        return
      }

      const script = document.createElement('script')
      script.id = SCRIPT_TAG_ID
      script.src = DRIVER_SCRIPT_URL
      script.async = true
      script.onload = () => this.initDriverInstance()
      script.onerror = () => {
        this.driverLoadError = true
        this.appendLog('驱动脚本加载失败，请检查网络或驱动服务', 'error')
      }
      document.body.appendChild(script)
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. UKey 实例创建 + setup 步骤执行
    // ═══════════════════════════════════════════════════════════════════════════
    async initDriverInstance() {
      // 3a. 创建实例
      try {
        const constructorName = this.config.driver?.create?.constructor
        if (!constructorName || !window[constructorName]) {
          throw new Error(`构造函数 "${constructorName}" 在 window 上不存在`)
        }
        const ctorArgs = this.config.driver.create?.args || []
        _instance = new window[constructorName](...ctorArgs)
        _ukey = {}
        this.driverLoaded = true
        this.appendLog(`驱动实例已创建 (${constructorName})`, 'success')
      } catch (e) {
        this.driverLoadError = true
        this.appendLog(`驱动实例创建失败: ${e.message}`, 'error')
        return
      }

      // 3b. 执行 setup 步骤（各厂商按需配置，结果可注册到 ukey.* 供后续使用）
      try {
        const setupSteps = this.config.driver?.setup?.steps || []
        for (const step of setupSteps) {
          const ctx = this.buildContext({ vars: {}, input: {} })
          const result = this.callUKeyMethod(step, ctx)
          if (step.register) this.applyRegister(step.register, result, {})
          this.appendLog(`初始化: ${step.label || step.name || step.call} 成功`, 'success')
        }
        this.deviceConnected = true
      } catch (e) {
        this.deviceConnected = false
        this.appendLog(`设备初始化失败: ${e.message}`, 'error')
        return
      }

      // 3c. 读取设备信息和证书信息
      await this.readDeviceInfo()
      await this.readCertInfo()
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. 设备信息读取（填充左上动态行）
    // ═══════════════════════════════════════════════════════════════════════════
    async readDeviceInfo() {
      const fields = this.config?.info?.device || []
      const ctx = this.buildContext({ vars: {}, input: {} })
      this.deviceInfoItems = fields.map(field => {
        const raw = this.resolveFieldValue(field, ctx)
        const value = raw == null ? '--' : String(raw)
        return { key: field.key, label: field.label, value, scope: field.scope || 'both' }
      })
      console.log('>>>>>>>>> ukey: ', _ukey)
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. 证书信息读取（填充右上）
    //    支持两种模式：
    //    - per-field：config.info.cert 为数组，每个字段独立 call / value
    //    - batch：config.info.cert 为对象 { fetch, fields }，先统一调用一次
    //             fetch 结果注入 cert.* 命名空间，字段用 {{ cert.xxx }} 引用
    // ═══════════════════════════════════════════════════════════════════════════
    async readCertInfo() {
      const certConfig = this.config && this.config.info && this.config.info.cert
      // 兼容数组（旧格式）和对象（新格式 { check?, fields }）
      const fields = Array.isArray(certConfig) ? certConfig : (certConfig && certConfig.fields || [])
      const certCheck = Array.isArray(certConfig) ? undefined : (certConfig && certConfig.check)

      const ctx = this.buildContext({ vars: {}, input: {} })

      // cert 级别 check 钩子：false → hasCert = false，显示「暂未签发证书」
      if (certCheck !== undefined) {
        let passed = false
        try {
          if (certCheck && typeof certCheck === 'object' && certCheck.call) {
            // call + 可选 expr
            const result = this.callUKeyMethod(certCheck, ctx)
            if (certCheck.expr) {
              passed = !!this.resolveValue(certCheck.expr, Object.assign({}, ctx, { result: result }))
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

      if (!fields.length) { this.certInfoItems = []; this.hasCert = false; this.certLoading = false; return }

      let hasAny = false

      const items = fields.map(field => {
        const rawVal = this.resolveFieldValue(field, ctx)

        const item = {
          key: field.key,
          label: field.label,
          value: rawVal == null ? '--' : String(rawVal)
        }

        if (rawVal != null) {
          hasAny = true
          // 归属判断：将此字段与当前用户对象的指定字段比对
          if (field.owner && this.object) {
            const userVal = this.object[field.owner.user_field]
            if (userVal != null) {
              const isSelf = String(rawVal) === String(userVal)
              item.tag = isSelf ? 'success' : 'danger'
              item.value = `${rawVal}（${isSelf ? '本人' : '他人'}）`
            }
          }
        }

        return item
      })

      this.certInfoItems = items
      this.hasCert = hasAny
      this.certLoading = false
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. 操作按钮处理入口
    // ═══════════════════════════════════════════════════════════════════════════
    async handleOperation(op) {
      // 操作前全局确认（op.confirm 配置）
      if (op.confirm) {
        try {
          await this.$confirm(
            op.confirm.message || '确认执行此操作？',
            op.confirm.title || '操作确认',
            {
              type: op.confirm.type || 'warning',
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }
          )
        } catch (_) { return }
      }

      this.running = true
      this.currentOperation = op.key
      try {
        const operationVars = {} // vars.* 命名空间，仅当前操作可见
        for (const step of (op.steps || [])) {
          await this.executeStep(step, operationVars)
        }
        this.appendLog(`操作「${op.label}」执行完成`, 'success')
        await this.readCertInfo()
      } catch (e) {
        this.appendLog(`操作「${op.label}」失败: ${e.message}`, 'error')
      } finally {
        this.running = false
        this.currentOperation = ''
      }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. 单步执行器
    // ═══════════════════════════════════════════════════════════════════════════
    async executeStep(step, operationVars) {
      let inputVars = {}

      // 7a. 若步骤声明了 input，先弹对话框收集用户输入
      if (step.input) {
        try {
          inputVars = await this.showInputDialog(
            step.input.fields || [],
            step.input.title || step.label || '请输入'
          )
        } catch (_) {
          throw new Error('操作已取消')
        }
      }

      const ctx = this.buildContext({ vars: operationVars, input: inputVars })
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
                : `返回值校验失败（${checkExpr}），实际返回: ${JSON.stringify(result)}`
              throw new Error(errMsg)
            }
          }
        }

        const stepLabel = step.label || step.name || step.call || '步骤'
        this.appendLog(`${stepLabel} 成功`, 'success')
      } catch (e) {
        const stepLabel = step.label || step.name || step.call || '步骤'
        const msg = `${stepLabel} 失败: ${e.message || e}`
        if (step.on_error === 'skip') {
          this.appendLog(msg + '（已跳过）', 'warn')
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
      const url = this.resolveValue(step.url, ctx)
      const body = step.body ? this.resolveObjectValues(step.body, ctx) : undefined
      return await this.$axios[method](url, body)
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 9. UKey 方法调用
    // ═══════════════════════════════════════════════════════════════════════════
    callUKeyMethod(step, ctx) {
      if (!step.call) return undefined
      if (!_instance || typeof _instance[step.call] !== 'function') {
        throw new Error(`UKey 方法 "${step.call}" 不存在`)
      }
      const args = this.resolveArgs(step.args || [], ctx)
      return _instance[step.call](...args)
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 10. 变量解析工具
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * 读取一个 info 字段的值，优先级：call > value（支持模板）
     * 任何错误均静默返回 null
     */
    resolveFieldValue(field, ctx) {
      if (field.call) {
        let result
        try {
          result = this.callUKeyMethod(field, ctx)
        } catch (_) { return null }
        // 调用成功后对返回值做校验（check 配置），未通过则不显示该字段
        if (field.check !== undefined) {
          const checkExpr = typeof field.check === 'string' ? field.check : field.check && field.check.expr
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
      return {
        ukey: _ukey,
        instance: _instance,
        vars,
        input,
        user: this.object || {},
        settings: this.publicSettings || {},
        config: this.config?.config || {}
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
          Object.entries(ctx).filter(([k]) => !['ukey', 'instance', 'vars', 'input', 'user', 'settings', 'config'].includes(k))
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
          const keys = Object.keys(nsMap)
          const vals = keys.map(k => nsMap[k])
          // eslint-disable-next-line no-new-func
          return new Function(...keys, `return (${e})`)(...vals)
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
      return argsDef.map(arg => {
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
            return Object.entries(resolved).map(([k, v]) => `${k}=${v}`).join(',')
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
      if (Array.isArray(obj)) return obj.map(i => this.resolveObjectValues(i, ctx))
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
      if (dot === -1) return
      const ns = register.substring(0, dot)
      const key = register.substring(dot + 1)
      const target = ns === 'ukey' ? _ukey : ns === 'vars' ? operationVars : null
      if (!target) return
      this.setNestedPath(target, key, value)
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
    showInputDialog(fields, title) {
      return new Promise((resolve, reject) => {
        const form = {}
        fields.forEach(f => { form[f.key] = '' })
        this.inputDialog = {
          visible: true,
          title,
          fields,
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
        if (f.validate.equals !== undefined) {
          const target = this.inputDialog.form[f.validate.equals]
          if (val !== target) {
            this.inputDialog.error = f.validate.message || `「${f.label}」与「${f.validate.equals}」不一致`
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
    &:last-child { border-bottom: none; }
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

// ── 证书加载中 ──────────────────────────────────────────────────────────────────
.cp-cert-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
  justify-content: center;
  color: #909399;
  font-size: 13px;

  .el-icon-loading { font-size: 16px; }
}

// ── 操作按钮表格（左中）─────────────────────────────────────────────────────────
.cp-action-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid #f0f0f0;
    &:last-child { border-bottom: none; }
  }

  td { padding: 10px 0; vertical-align: middle; }

  .cp-action-desc {
    padding-right: 12px;

    .cp-action-title { font-size: 13px; color: #303133; line-height: 1.4; }
    .cp-action-hint  { font-size: 12px; color: #909399; margin-top: 2px; line-height: 1.4; }
  }

  .cp-action-btn {
    width: 72px;
    text-align: right;
    white-space: nowrap;

    ::v-deep .el-button { width: 100%; }
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

  .cp-log-time { color: #6a9955; flex-shrink: 0; }
  .cp-log-msg  { color: #d4d4d4; }

  &.cp-log-success .cp-log-msg { color: #4ec9b0; }
  &.cp-log-error   .cp-log-msg { color: #f48771; }
  &.cp-log-warn    .cp-log-msg { color: #dcdcaa; }
}
</style>
