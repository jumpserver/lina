<template>
  <Dialog
    v-if="visible"
    v-bind="$attrs"
    :visible="visible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :modal="false"
    :show-cancel="disabled"
    :show-confirm="false"
    :cancel-title="$tc('Close')"
    :title="$tc('PlatformProtocolConfig') + '：' + protocol.name"
    class="setting-dialog"
    width="800px"
    @cancel="closeDialog"
    @update:visible="handleVisibleChange"
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
import { getRuntimeActionMeta } from '@/libs/context/runtime'

export default {
  name: 'ProtocolSetting',
  inheritAttrs: false,
  components: {
    Dialog,
    AutoDataForm
  },
  emits: ['update:visible', 'confirm'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
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
    const platform = this.$context.get('platform')
    return {
      platform: '',
      loading: true,
      form: this.protocol,
      platformDetail: platform ? '#/settings/platforms?id=' + platform : '',
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
      const drawActionMeta = await getRuntimeActionMeta(this)
      const platform = drawActionMeta?.row?.platform?.id
      const name = drawActionMeta?.row?.platform?.name

      if (platform) {
        this.platformDetail = `${window.__UI_BASE__}#/settings/platforms?id=${platform}&name=${name}`
      } else {
        this.platformDetail = ''
      }
    } catch (e) {
      this.platformDetail = ''
    }
  },
  methods: {
    closeDialog() {
      this.$emit('update:visible', false)
    },
    handleVisibleChange(visible) {
      this.$emit('update:visible', visible)
    },
    onSubmit(form) {
      // protocol 是只读 prop，不能重新赋值或就地 mutate（会触发 proxy set 陷阱报错）。
      // 先把编辑后的表单值通过 confirm 抛给父组件（由父组件合并到自己的协议项数据上），
      // 再关闭弹窗，避免关闭触发 v-if 卸载导致 confirm 尚未派发。
      this.$emit('confirm', form)
      this.closeDialog()
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
