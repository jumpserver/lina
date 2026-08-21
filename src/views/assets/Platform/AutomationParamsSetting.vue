<template>
  <div class="content">
    <el-button
      v-if="hasButton"
      :disabled="!canSetting"
      :icon="icon"
      class="proto-setting"
      size="small"
      type="primary"
      @click="onSetting"
    />
    <Dialog
      v-model:visible="isVisible"
      :show-cancel="false"
      :show-confirm="false"
      :title="title"
      width="860px"
      @update:visible="handleVisibleChange"
    >
      <AutoDataForm
        v-if="isVisible"
        v-bind="config"
        ref="autoDataForm"
        :form="form"
        class="data-form"
        @submit="onSubmit"
      />
    </Dialog>
  </div>
</template>

<script>
import i18n from '@/i18n/i18n'
import { getActionMeta } from '@/api/common'
import Dialog from '@/components/Dialog'
import AutoDataForm from '@/components/Form/AutoDataForm'
import { DynamicInput, Switcher } from '@/components/Form/FormFields'

export default {
  components: {
    Dialog,
    AutoDataForm
  },
  emits: ['input', 'submit', 'update:visible', 'canSetting'],
  props: {
    value: {
      type: [String, Object],
      default: () => ({})
    },
    title: {
      type: String,
      default: () => i18n.t('PushParams')
    },
    btnText: {
      type: String,
      default: function () {
        return ''
      }
    },
    icon: {
      type: String,
      default: 'Setting'
    },
    url: {
      type: String,
      default: `/api/v1/assets/platform-automation-methods/`
    },
    method: {
      type: String,
      default: ''
    },
    pushAccountParams: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    },
    hasButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isVisible: this.visible,
      canSetting: true,
      form: this.value,
      remoteMeta: {},
      config: {
        url: this.url,
        hasSaveContinue: false,
        hasButtons: true,
        hasReset: false,
        fields: [],
        method: 'get'
      },
      preFieldsMeta: {
        change_secret_by_ssh: {
          commands: {
            helpTextAsTip: false
          }
        }
      }
    }
  },
  watch: {
    visible(val) {
      this.isVisible = val
    },
    value: {
      handler(val) {
        this.form = this.normalizeForm(val)
      },
      deep: true
    },
    method(iNew, iOld) {
      if (iNew !== iOld) {
        this.getUrlMeta()
      }
    }
  },
  mounted() {
    this.getUrlMeta()
  },
  methods: {
    async getUrlMeta() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      this.remoteMeta = getActionMeta(data, this.config.method)

      if (this.onCanSetting()) {
        this.setFormConfig()
      }
    },
    onCanSetting() {
      const filterField = Object.keys(this.remoteMeta)
      this.canSetting = filterField.includes(this.method) && this.$hasPerm('assets.change_platform')
      this.$emit('canSetting', this.canSetting)
      return this.canSetting
    },
    normalizeForm(val) {
      return val && typeof val === 'object' && !Array.isArray(val) ? { ...val } : {}
    },
    hasParams(val) {
      return val && typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length > 0
    },
    getResolvedParams() {
      if (this.hasParams(this.value)) {
        return this.value
      }
      if (this.hasParams(this.pushAccountParams)) {
        return this.pushAccountParams
      }
      return {}
    },
    getSavedMethodParams() {
      const resolved = this.getResolvedParams()
      const fromResolved = resolved?.[this.method]
      if (this.hasParams(fromResolved)) {
        return fromResolved
      }
      return {}
    },
    setFormConfig() {
      let fields = []
      const fieldsMeta = {}
      const { method } = this
      const filterField = this.remoteMeta[method]
      if (!filterField) {
        return
      }
      fields = [[filterField.label, [method]]]
      fieldsMeta[method] = {
        fields: [],
        fieldsMeta: {}
      }

      const param = this.getSavedMethodParams()
      if (Object.keys(filterField?.children || {}).length > 0) {
        for (const [k, v] of Object.entries(filterField.children)) {
          let component = 'el-input'
          const el = {}
          switch (v?.type) {
            case 'list':
              component = DynamicInput
              break
            case 'boolean':
              component = Switcher
              break
            case 'text':
              el['text'] = 'textarea'
              break
          }

          const saved = param[k]
          const item = {
            ...v,
            component,
            el,
            default: saved !== undefined && saved !== null ? saved : v.default
          }
          fieldsMeta[method].fields.push(k)
          fieldsMeta[method].fieldsMeta[k] = item
        }
      }

      const preDefineFieldMeta = this.preFieldsMeta[method]
      if (preDefineFieldMeta) {
        for (const [k, v] of Object.entries(preDefineFieldMeta)) {
          for (const [j, l] of Object.entries(v)) {
            fieldsMeta[method]['fieldsMeta'][k][j] = l
          }
        }
      }

      this.config.fields = fields
      this.config.fieldsMeta = fieldsMeta
    },
    onSetting() {
      const params = this.getResolvedParams()
      this.form = this.normalizeForm(params)
      this.setFormConfig()
      this.isVisible = true
    },
    onSubmit(form) {
      this.$emit('input', form)
      this.$emit('submit', form)
      this.isVisible = false
      this.$emit('update:visible', this.isVisible)
    },
    handleVisibleChange(visible) {
      this.isVisible = visible
      this.$emit('update:visible', visible)
    }
  }
}
</script>

<style lang="scss" scoped>
// 作为 method 下拉右侧的 append 按钮:等高、去掉左侧圆角与左边框,和下拉拼成一体的 input-group。
.proto-setting {
  width: 32px;
  min-width: 32px;
  height: 30px;
  margin-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
