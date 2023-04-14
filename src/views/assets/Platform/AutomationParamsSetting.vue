<template>
  <div class="content">
    <el-button
      v-if="hasButton"
      :disabled="!canSetting"
      size="mini"
      class="setting"
      :icon="icon"
      type="primary"
      @click="onSetting"
    >
      {{ btnText }}
    </el-button>
    <Dialog
      v-if="isVisible"
      width="60%"
      :visible.sync="isVisible"
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
        v-on="$listeners"
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
        return this.$t('assets.PushParams')
      }
    },
    btnText: {
      type: String,
      default: function() {
        return this.$t('common.Setting')
      }
    },
    icon: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: `/api/v1/assets/platform-automation-methods/`
    },
    method: {
      type: String,
      default: ''
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
      this.isVisible = true
    },
    onSubmit(form) {
      this.$emit('input', form)
      this.isVisible = false
      this.$emit('update:visible', this.isVisible)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
