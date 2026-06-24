<template>
  <GenericCreateUpdateForm
    v-bind="settings"
    ref="form"
    class="form"
    @perform-error="handlePerformError"
    @perform-finished="handlePerformFinished"
    @submit-success="handleSubmitSuccess"
  />
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import { ACCOUNT_PROVIDER_ATTRS_MAP, encryptAttrsField } from '@/views/assets/Cloud/const'
import { RequiredChange, specialEmojiCheck } from '@/components/Form/DataForm/rules'
import { UploadKey } from '@/components'
import RegionPanel from './RegionPanel'

export default {
  name: 'AuthPanel',
  components: {
    GenericCreateUpdateForm
  },
  props: {
    provider: {
      type: String,
      default: () => ''
    },
    object: {
      type: Object,
      default: () => {}
    },
    origin: {
      type: String,
      default: ''
    }
  },
  data() {
    const vm = this

    function setFieldAttrs(provider) {
      const fieldsObject = {}
      const updateNotRequiredFields = [
        'access_key_secret',
        'client_secret',
        'password',
        'sc_password',
        'oc_password',
        'cert_file',
        'key_file',
        'public_key',
        'private_key'
      ]
      for (const item of ACCOUNT_PROVIDER_ATTRS_MAP[provider].attrs) {
        fieldsObject[item] = {
          rules: updateNotRequiredFields.includes(item) && vm.object?.id ? [] : [RequiredChange]
        }
      }
      return fieldsObject
    }

    return {
      priSubmitForm: null,
      submitType: 'auto',
      settings: {
        url: `/api/v1/xpack/cloud/accounts/`,
        labelWidth: '140px',
        fields: [
          [this.$t('Basic'), ['name']],
          [this.$t('Auth'), ['attrs']],
          [this.$t('Other'), ['regions']]
        ],
        fieldsMeta: {
          name: {
            rules: [RequiredChange, specialEmojiCheck]
          },
          attrs: {
            labelWidth: '140px',
            encryptedFields: ['access_key_secret'],
            fields: ACCOUNT_PROVIDER_ATTRS_MAP[this.provider].attrs,
            fieldsMeta: {
              // 必须放在最上面，下面特殊制定的字段才会覆盖默认
              ...setFieldAttrs(this.provider),
              service_account_key: {
                label: this.$t('ServerAccountKey'),
                component: UploadKey,
                el: {
                  toFormat: 'object'
                }
              },
              cert_file: {
                label: this.$t('Certificate'),
                component: UploadKey,
                el: {
                  toFormat: 'object'
                }
              },
              key_file: {
                label: this.$t('SecretKey'),
                component: UploadKey,
                el: {
                  toFormat: 'object'
                }
              },
              password: {
                rules: this.$route.params.id ? [] : [RequiredChange]
              },
              public_key: {
                label: this.$t('PublicKey'),
                rules: this.$route.params.id ? [] : [RequiredChange]
              },
              private_key: {
                label: this.$t('PrivateKey'),
                rules: this.$route.params.id ? [] : [RequiredChange]
              },
              project: {
                label: this.$t('Project')
              },
              hostname_prefix: {
                required: false
              }
            }
          },
          regions: {
            label: this.$tc('Region'),
            component: RegionPanel,
            el: {
              provider: this.provider,
              regions: this.object.task?.regions || [],
              getAuthInfo: () => {
                if (this.object?.id) {
                  return this.object.id
                }
                const form = this.$refs.form.$refs.form.dataForm
                form.$refs.form.validate()
                return form.getFormValue()['attrs']
              }
            }
          }
        },
        defaultButton: false,
        submitMethod: this.object?.id ? 'put' : 'post',
        moreButtons: [
          {
            title: this.$tc('Next'),
            type: 'primary',
            loading: false,
            hidden: this.object?.id,
            callback: (value, form, btn) => {
              this.submitForm(form, btn, 'manual')
            }
          },
          {
            title: this.$t('Confirm'),
            type: 'primary',
            loading: false,
            hidden: !this.object?.id,
            callback: (value, form, btn) => {
              this.submitForm(form, btn, 'update')
            }
          },
          {
            title: this.$tc('Cancel'),
            callback: () => {
              this.$emit('update:visible', false)
            }
          }
        ],
        getUrl: () => {
          if (this.object?.id) {
            return `${vm.settings.url}${this.object.id}/?provider=${this.provider}`
          }
          return `${vm.settings.url}?provider=${this.provider}`
        },
        cleanFormValue(values) {
          const newValues = JSON.parse(JSON.stringify(values))
          newValues['attrs'] = encryptAttrsField(newValues.attrs)
          newValues['provider'] = vm.provider
          newValues['category'] = this.$route.query.category || 'host'
          return newValues
        },
        addContinue: true
      }
    }
  },
  methods: {
    submitForm(form, btn, submitType) {
      this.priSubmitForm = form
      form.validate((valid) => {
        if (valid) {
          btn.loading = true
          this.$refs.form.$refs.form.dataForm.submitForm('form', false)
          this.submitType = submitType
        }
      })
    },
    handleSubmitSuccess(res) {
      if (this.submitType === 'manual') {
        this.$emit('update:object', res)
        this.$emit('update:active', 2)
      } else if (this.submitType === 'update') {
        setTimeout(() => {
          this.$emit('submitSuccess')
          this.$emit('update:visible', false)
        }, 500)
      }
    },
    handlePerformFinished() {
      for (const btn of this.settings.moreButtons) {
        btn.loading = false
      }
    },
    handlePerformError(errorData) {
      if (Object.prototype.hasOwnProperty.call(errorData, 'attrs')) {
        for (const f in errorData['attrs']) {
          this.setAttrsFieldError(f, errorData['attrs'][f])
        }
      }
    },
    setAttrsFieldError(name, errors) {
      for (const item of this.priSubmitForm.content) {
        if (item.id === 'attrs') {
          errors = Array.isArray(errors) ? errors.join(',') : errors
          const totalFields = item.el.fields
          const field = totalFields.find((v) => v.prop === name)
          if (!field) {
            return
          }
          if (typeof errors === 'string') {
            field.el.errors = errors
            field.attrs.error = errors
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-form-item.form-buttons) {
  text-align: right;
}

.form {
  // 以表单宽度作为容器查询的基准，使抽屉变窄时（即便在大屏下）也能触发响应式
  container-type: inline-size;
  margin-right: 0;

  :deep(form) {
    margin-right: 0;
    padding-right: 0;
    padding-bottom: 10px;
  }

  :deep(.el-form-item__label) {
    min-height: 30px;
    height: auto;
    align-items: center;
  }

  :deep(.el-form-item__label > span) {
    max-width: none;
    overflow: visible;
    white-space: normal;
    word-break: break-word;
    text-overflow: clip;
    line-height: 1.35;
  }

  :deep(.el-form-item-attrs) {
    .el-form-item__content {
      min-width: 0;
    }
  }

  :deep(.el-form-item-regions) {
    .el-form-item__label,
    .el-form-item__content {
      min-height: 30px;
    }

    .el-form-item__content {
      justify-content: center;
      gap: 0;
    }
  }

  // 正常宽度下：输入框设最小宽度兜底，避免被压缩到无法使用
  :deep(.el-form-item__content) {
    .el-input,
    .el-select,
    .el-cascader,
    .el-input-number {
      min-width: 180px;
    }
  }

  // 容器变窄时：label 移到输入框上方，输入框占满整行，保证可用宽度
  @container (max-width: 480px) {
    :deep(.el-form-item) {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    :deep(.el-form-item__label-wrap),
    :deep(.el-form-item__label) {
      width: 100% !important;
      flex: 0 0 auto !important;
      justify-content: flex-start;
      text-align: left;
    }

    :deep(.el-form-item__content) {
      width: 100%;
      margin-left: 0 !important;

      .el-input,
      .el-select,
      .el-cascader,
      .el-input-number {
        width: 100%;
        min-width: 0;
      }
    }

    // 子表单（认证设置）内部同步切换为 label-top
    :deep(.sub-form .el-form-item__label-wrap) {
      margin-left: 0 !important;
    }
  }
}
</style>
