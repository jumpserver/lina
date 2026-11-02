<template>
  <div>
    <el-button size="mini" type="primary" icon="el-icon-setting" @click="visible=true">{{ $t('Setting') }}</el-button>
    <Dialog
      v-if="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="title"
      :visible.sync="visible"
      width="70%"
      @confirm="onConfirm()"
      v-on="$listeners"
    >
      <GenericCreateUpdateForm ref="form" v-bind="iConfig" @submitSuccess="submitSuccess" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import { runSettingsTest } from '@/views/settings/testSettings'

export default {
  name: 'Base',
  components: {
    Dialog,
    GenericCreateUpdateForm
  },
  inject: {
    getSMSTestSettings: { default: () => () => ({}) }
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    iConfig() {
      return this.config
    }
  },
  methods: {
    testSettings(value, form, button, backend) {
      return runSettingsTest(this, {
        value: { ...value, ...this.getSMSTestSettings() },
        form,
        button,
        encryptedFields: this.config.encryptedFields || [],
        request: data => this.$axios.post(`/api/v1/settings/sms/${backend}/testing/`, data, {
          disableFlashErrorMsg: true
        }),
        onError: error => this.testPerformError(error)
      })
    },
    onConfirm() {
    },
    submitSuccess(res) {
      this.$emit('input', !!res[this.enableField])
      this.visible = false
    },
    testPerformError(error) {
      const data = error.response.data
      for (const key of Object.keys(data)) {
        let value = data[key]
        if (value instanceof Array) {
          value = value.join(';')
        }
        this.$refs.form.$refs.form.setFieldError(key, value)
      }
    }
  }
}
</script>
