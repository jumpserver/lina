<template>
  <Dialog
    v-bind="$attrs"
    v-if="$attrs.visible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :modal="false"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('PlatformProtocolConfig') + '：' + protocol.name"
    class="setting-dialog"
    width="800px"
  >
    <el-alert v-if="disabled && platformDetail" style="margin-bottom: 10px" type="info">
      {{ $t('InheritPlatformConfig') }}
      <el-link :href="platformDetail" class="link-more" target="_blank">
        {{ $t('View') }}
      </el-link>
      <i class="fa fa-external-link" />
    </el-alert>
    <AutoDataForm
      v-bind="config"
      :disabled="disabled"
      :form="form"
      class="data-form"
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
      platform: '',
      loading: true,
      form: this.protocol,
      platformDetail: platform ? '#/console/assets/platforms/' + platform : '',
      config: {
        hasSaveContinue: false,
        hasButtons: !this.disabled,
        url: '/api/v1/assets/protocol-settings/?name=' + this.protocol.name,
        fields: [
          [vm.$t('Basic'), ['primary', 'required', 'default', 'public']],
          [vm.$t('Advanced'), ['setting']]
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
  async mounted() {
    try {
      const drawActionMeta = await this.$store.dispatch('common/getDrawerActionMeta')
      const platform = drawActionMeta?.row?.platform?.id
      const name = drawActionMeta?.row?.platform?.name

      if (platform) {
        this.platformDetail = `/ui/#/settings/platforms?id=${platform}&name=${name}`
      } else {
        this.platformDetail = ''
      }
    } catch (e) {
      this.platformDetail = ''
    }
  },
  methods: {
    onSubmit(form) {
      this.protocol = Object.assign(this.protocol, form)
      this.$emit('update:visible', false)
      this.$emit('confirm', this.protocol)
    },
    openInNewTab() {
      window.open(this.platformDetail, '_blank')
    }
  }
}
</script>

<style lang="scss">
.setting-dialog .el-dialog__body {
  padding: 16px 20px 20px;
  overflow-x: hidden;
}

.setting-dialog .data-form,
.setting-dialog .el-form {
  width: 100%;
  min-width: 0;
  margin-right: 0;
}

.setting-dialog .el-form-item,
.setting-dialog .el-form-item__content {
  min-width: 0;
}

.setting-dialog .data-form .el-form-item.form-buttons {
  padding-top: 10px;
  margin-bottom: 0;
}

.link-more {
  font-size: 10px;
  border-bottom: solid 1px;
  color: inherit;
}
</style>
