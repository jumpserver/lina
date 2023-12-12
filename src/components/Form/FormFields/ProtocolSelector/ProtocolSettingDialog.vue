<template>
  <Dialog
    v-if="$attrs.visible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('assets.PlatformProtocolConfig') + '：' + protocol.name"
    class="setting-dialog"
    v-bind="$attrs"
    width="800px"
    v-on="$listeners"
  >
    <el-alert v-if="disabled && platformDetail" style="margin-bottom: 10px" type="success">
      {{ $t('assets.InheritPlatformConfig') }}
      <el-link :href="platformDetail" class="link-more" target="_blank">
        {{ $t('common.View') }}
      </el-link>
      <i class="fa fa-external-link" />
    </el-alert>
    <AutoDataForm
      :disabled="disabled"
      :form="form"
      class="data-form"
      v-bind="config"
      @submit="onSubmit"
    />
  </Dialog>
</template>

<script>
import { AutoDataForm, Dialog } from '@/components'
import JsonEditor from '@/components/Form/FormFields/JsonEditor.vue'

export default {
  name: 'ProtocolSetting',
  components: {
    Dialog,
    AutoDataForm
  },
  props: {
    protocol: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const vm = this
    const platform = this.$route.query.platform
    return {
      loading: true,
      form: this.protocol,
      platformDetail: platform ? '#/console/assets/platforms/' + platform : '',
      config: {
        hasSaveContinue: false,
        hasButtons: !this.disabled,
        url: '/api/v1/assets/protocol-settings/?name=' + this.protocol.name,
        fields: [
          [vm.$t('common.Basic'), [
            'primary', 'required', 'default', 'public'
          ]],
          [vm.$t('common.Advanced'), ['setting']]
        ],
        fieldsMeta: {
          setting: {
            fields: '__all__',
            fieldsMeta: {
              username_selector: {
                hidden: (formValue) => formValue['autofill'] !== 'basic'
              },
              password_selector: {
                hidden: (formValue) => formValue['autofill'] !== 'basic'
              },
              submit_selector: {
                hidden: (formValue) => formValue['autofill'] !== 'basic'
              },
              script: {
                component: JsonEditor,
                hidden: (formValue) => formValue['autofill'] !== 'script'
              }
            }
          },
          public: {
            disabled: this.protocol.name === 'winrm',
            hidden: (formValue) => {
              if (this.protocol.name === 'winrm') {
                formValue['public'] = false
              }
            }
          }
        }
      }
    }
  },
  methods: {
    onSubmit(form) {
      this.protocol = Object.assign(this.protocol, form)
      this.$emit('update:visible', false)
      this.$emit('confirm', this.protocol)
    }
  }
}
</script>

<style lang="scss" scoped>
.data-form > > > .el-form-item.form-buttons {
  padding-top: 10px;
  margin-bottom: 0;
}

.setting-dialog > > > .el-dialog__body {
  padding-top: 10px;
}

.link-more {
  font-size: 10px;
  border-bottom: solid 1px;
  color: inherit;
}
</style>
