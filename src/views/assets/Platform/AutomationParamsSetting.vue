<template>
  <div class="content">
    <el-button
      :disabled="!isDisabled"
      size="small"
      class="setting"
      :icon="icon"
      @click="onSetting"
    >
      {{ btnText }}
    </el-button>
    <Dialog
      v-if="visible"
      width="60%"
      :visible.sync="visible"
      :title="title"
      :show-cancel="false"
      :show-confirm="false"
      :destroy-on-close="true"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <AutoDataForm
        ref="autoDataForm"
        :form="form"
        class="data-form"
        v-bind="config"
        @submit="onSubmit"
      />
    </Dialog>
  </div>
</template>

<script>
import { Dialog, AutoDataForm } from '@/components'

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
        return this.$t('assets.PushSetting')
      }
    },
    btnText: {
      type: String,
      default: null
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
    }
  },
  data() {
    return {
      visible: false,
      isDisabled: true,
      form: this.value,
      remoteMeta: {},
      config: {
        url: this.url,
        hasSaveContinue: false,
        hasButtons: true,
        fields: [],
        method: 'get',
        fieldsMeta: {}
      },
      iValue: this.value
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      this.remoteMeta = data.actions[this.config.method.toUpperCase()] || {}

      if (this.hasDisabled()) {
        this.setFormConfig()
      }
    },
    hasDisabled() {
      const filterField = Object.keys(this.remoteMeta)
      this.isDisabled = filterField.includes(this.method)
      return this.isDisabled
    },
    setFormConfig() {
      const { method } = this
      this.config.fieldsMeta = this.getFieldsMeta()
      this.config.fields = [[method, [method]]]
    },
    getFieldsMeta() {
      const fieldsMeta = {}
      const { method } = this
      const filterField = this.remoteMeta[method]
      fieldsMeta[method] = {
        fields: [],
        fieldsMeta: {}
      }

      if (Object.keys(filterField?.children || {}).length > 0) {
        for (const [k, v] of Object.entries(filterField.children)) {
          const item = {
            ...v,
            type: 'input'
          }
          fieldsMeta[method].fields.push(k)
          fieldsMeta[method].fieldsMeta[k] = item
        }
      }

      return fieldsMeta
    },
    onSetting() {
      this.visible = true
      console.log('method: ', this.method)
      console.log('this.value', this.value)
    },
    onSubmit(form) {
      this.$emit('input', form)
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  display: flex;
}
.setting {
  background-color: #F5F7FA;
  border: 1px solid #DCDFE6;
  font-size: 14px;
  color: #1a1a1a;
  padding: 9px 20px;
}
>>> .el-button.is-disabled, .el-button.is-disabled:hover {
  color: #C0C4CC!important;
  cursor: not-allowed!important;
  background-image: none!important;
  background-color: #FFF!important;
  border-color: #EBEEF5!important;
}
</style>
