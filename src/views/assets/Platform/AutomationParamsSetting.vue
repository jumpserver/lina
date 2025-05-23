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
      :show-cancel="false"
      :show-confirm="false"
      :title="title"
      :visible.sync="isVisible"
      width="60%"
      @close="onDialogClose"
    >
      <AutoDataForm
        ref="autoDataForm"
        :form="form"
        class="data-form"
        v-bind="config"
        @submit="onSubmit"
        v-on="$listeners"
      />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import AutoDataForm from '@/components/Form/AutoDataForm'
import { DynamicInput, Switcher } from '@/components/Form/FormFields'

export default {
  components: {
    Dialog,
    AutoDataForm
  },
  props: {
    value: {
      type: [String, Object],
      default: () => ({})
    },
    title: {
      type: String,
      default: function() {
        return this.$t('PushParams')
      }
    },
    btnText: {
      type: String,
      default: function() {
        return ''
      }
    },
    icon: {
      type: String,
      default: 'el-icon-setting'
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
        'change_secret_by_ssh': {
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
      this.remoteMeta = data.actions[this.config.method.toUpperCase()] || {}

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
    setFormConfig() {
      let fields = []
      const fieldsMeta = {}
      const { method } = this
      const filterField = this.remoteMeta[method]
      fields = [[filterField.label, [method]]]
      fieldsMeta[method] = {
        fields: [],
        fieldsMeta: {}
      }

      const param = this.pushAccountParams[method]
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
              // component = 'checkbox'
              break
            case 'text':
              el['text'] = 'textarea'
              break
          }

          if (param) {
            v.default = param[k] || v.default
          }
          const item = { ...v, component: component, el: el }
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
      this.isVisible = true
    },
    onSubmit(form) {
      this.$emit('input', form)
      this.isVisible = false
      this.$emit('update:visible', this.isVisible)
    },
    onDialogClose() {
      this.$emit('update:visible', this.isVisible)
    }
  }
}
</script>

<style lang="scss" scoped>
.proto-setting {
  margin-top: 1px;
  height: 30px;
  vertical-align: super;
}
</style>
