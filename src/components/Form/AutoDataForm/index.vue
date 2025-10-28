<template>
  <div>
    <DataForm
      v-if="!loading"
      ref="dataForm"
      :fields="totalFields"
      :form="iForm"
      :server-errors="serverErrors"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <template
        v-for="(group, i) in groups"
        :slot="'id:'+group.name"
      >
        <FormGroupHeader
          v-if="!groupHidden(group, i)"
          :key="'group-' + group.name"
          :group="group"
          :index="i"
          :line="i !== 0 && !groupHidden(groups[i - 1], i - 1)"
        />
      </template>
    </DataForm>
  </div>
</template>

<script>
import DataForm from '../DataForm/index.vue'
import FormGroupHeader from '@/components/Form/FormGroupHeader/index.vue'
import { FormFieldGenerator } from '@/components/Form/AutoDataForm/utils'
import { UniqueCheck } from '@/components/Form/DataForm/rules'

export default {
  name: 'AutoDataForm',
  components: {
    DataForm,
    FormGroupHeader
  },
  props: {
    url: {
      type: String,
      required: true
    },
    method: {
      type: String,
      default: 'post'
    },
    fields: {
      type: Array,
      default: () => {
        return []
      }
    },
    form: {
      type: Object,
      default: () => ({})
    },
    fieldsMeta: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      remoteMeta: {},
      totalFields: [],
      loading: true,
      groups: [],
      errors: {},
      serverErrors: {}
    }
  },
  computed: {
    dataForm() {
      return this.$refs.dataForm
    },
    iForm() {
      const iForm = {}
      Object.entries(this.form).forEach(([key, value]) => {
        // 初始值是 choice 对象
        if (value && typeof value === 'object' && value.label && value.value !== undefined) {
          iForm[key] = value.value
        } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' &&
          value[0].label && value[0].value !== undefined) {
          iForm[key] = value.map(item => item.value)
        } else {
          iForm[key] = value
        }
      })
      return iForm
    }
  },
  mounted() {
    // this.$log.debug('>>> Method: ', this.method)
    this.optionUrlMetaAndGenerateColumns()
  },
  methods: {
    async optionUrlMetaAndGenerateColumns() {
      let data = { actions: {} }
      if (this.url) {
        data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      }
      this.remoteMeta = data.actions[this.method.toUpperCase()] || {}
      this.$emit('afterRemoteMeta', this.remoteMeta)
      this.generateColumns()
      this.$emit('afterGenerateColumns', this.totalFields)
      this.cleanFormValue()
      // 初始化时清空错误
      this.serverErrors = {}
      this.loading = false
    },
    generateColumns() {
      const generator = new FormFieldGenerator()
      this.totalFields = generator.generateFields(this.fields, this.fieldsMeta, this.remoteMeta)
      this.groups = generator.groups
      this.$log.debug('Total fields: ', this.totalFields)
      this.applyUniqueRules()
    },
    applyUniqueRules() {
      const fields = this.totalFields || []
      const currentIdGetter = () => {
        return this.$route?.params?.id || this.form?.id || this.iForm?.id
      }

      // 移除 url 后拼接的参数
      const defaultListUrl = (() => {
        try {
          const u = new URL(this.url, location.origin)
          u.pathname = u.pathname.replace(/\/(\d+|[0-9a-fA-F-]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12})\/?$/, '/')
          return u.origin ? u.origin + u.pathname : u.pathname
        } catch (e) {
          return (this.url || '').replace(/\/(\d+|[0-9a-fA-F-]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12})\/?($|\?)/, '/$2')
        }
      })()

      fields.forEach(field => {
        const conf = field?.uniqueCheck

        if (!conf) return

        const confObj = (typeof conf === 'object') ? conf : {}
        const param = confObj.param || field.prop || field.id
        const url = confObj.url || defaultListUrl
        const label = confObj.label || field.label || param
        const entityName = confObj.entityName || ''

        if (!Array.isArray(field.rules)) field.rules = []

        field.rules.push(UniqueCheck({
          url,
          param,
          label,
          entityName,
          getIgnoreId: currentIdGetter,
          fieldName: field.prop || field.id
        }))
      })
    },
    _cleanFormValue(form, remoteMeta) {
      if (!form) {
        form = {}
      }
      for (const [k, v] of Object.entries(remoteMeta)) {
        let valueSet = form[k]
        if (v.type === 'nested object' && v.children) {
          // 有一些字段属性时 nested object 类型，但是没有 children，没有children的不需要走递归逻辑，
          // 比如：认证配置中的属性映射字段
          if (typeof valueSet !== 'object') {
            // 处理一些前端没有设置初始值的情况
            valueSet = {}
          }
          form[k] = valueSet
          this._cleanFormValue(valueSet, v.children)
        }
        if (valueSet !== undefined) {
          continue
        }
        if (v.default === undefined) {
          continue
        }
        form[k] = v.default
      }
    },
    cleanFormValue() {
      this._cleanFormValue(this.iForm, this.remoteMeta)
    },
    _getElFormInstance() {
      try {
        return this.$refs?.dataForm?.$refs?.form?.$refs?.elForm || null
      } catch (e) {
        return null
      }
    },
    /**
     * @description 仅清理 UI 的错误展示,不触发表单内容重建
     */
    clearAllFieldErrors() {
      const elForm = this._getElFormInstance()
      if (elForm && Array.isArray(elForm.fields)) {
        elForm.fields.forEach((item) => {
          item.validateMessage = ''
          item.validateState = ''
        })
      }
      // 不修改 totalFields/attrs，避免触发 content 重建导致输入丢失
      this.serverErrors = {}
    },
    setFieldError(name, error) {
      error = (error || '').toString().replace(/[。.]+$/, '')
      const elForm = this._getElFormInstance()
      if (elForm && Array.isArray(elForm.fields)) {
        const item = elForm.fields.find(f => f.prop === name)
        if (item) {
          item.validateMessage = error
          item.validateState = error ? 'error' : ''
        }
      }
      // 不写入 totalFields，避免触发 innerContent 变化导致表单值被覆盖
      this.$set(this.serverErrors, name, error)
    },
    setErrors(errors) {
      const mapped = {}
      Object.entries(errors || {}).forEach(([k, v]) => {
        let msg = v
        if (Array.isArray(v)) msg = v.join('; ')
        else if (typeof v === 'object' && v !== null) msg = JSON.stringify(v)
        mapped[k] = String(msg || '')
      })
      this.serverErrors = mapped
      const elForm = this._getElFormInstance()
      if (elForm && Array.isArray(elForm.fields)) {
        elForm.fields.forEach((item) => {
          const msg = mapped[item.prop] || ''
          item.validateMessage = msg
          item.validateState = msg ? 'error' : ''
        })
      }
    },
    groupHidden(group, i) {
      for (const field of group.fields) {
        let hidden = field.hidden
        if (typeof hidden === 'function') {
          hidden = hidden(this.iForm)
        }
        if (!hidden) {
          return false
        }
      }
      return true
    }
  }

}
</script>
