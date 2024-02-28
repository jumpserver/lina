<template>
  <div class="content">
    <el-button
      v-if="hasButton"
      :disabled="!canSetting"
      size="small"
      class="setting"
      :icon="icon"
      type="primary"
      @click="onSetting"
    />
    <Dialog
      v-if="isVisible"
      width="60%"
      :visible.sync="isVisible"
      :title="title"
      :show-cancel="false"
      :show-confirm="false"
      :destroy-on-close="true"
      @close="onDialogClose"
    >
      <AutoDataForm
        ref="autoDataForm"
        :form="form"
        class="data-form"
        v-bind="config"
        v-on="$listeners"
        @submit="onSubmit"
      />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '../../../components/Dialog'
import AutoDataForm from '../../../components/Form/AutoDataForm'
import { DynamicInput } from '../../../components/Form/FormFields'

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
        return this.$t('assets.PushParams')
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
        method: 'get',
        fieldsMeta: {}
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
      this.canSetting = filterField.includes(this.method)
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
          switch (v?.type) {
            case 'list':
              component = DynamicInput
              break
          }

          if (param) {
            v.default = param[k] || v.default
          }
          const item = { ...v, component: component }
          fieldsMeta[method].fields.push(k)
          fieldsMeta[method].fieldsMeta[k] = item
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
.setting {
  height: 34px;
  padding-top: 10px;
}
</style>
