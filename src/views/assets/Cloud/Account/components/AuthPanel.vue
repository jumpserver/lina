<template>
  <GenericCreateUpdateForm
    ref="form"
    class="form"
    v-bind="settings"
    @submitSuccess="handleSubmitSuccess"
    @performFinished="handlePerformFinished"
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
    }
  },
  data() {
    const vm = this
    function setFieldAttrs(provider) {
      const fieldsObject = {}
      const updateNotRequiredFields = ['access_key_secret', 'client_secret', 'password', 'sc_password', 'oc_password', 'cert_file', 'key_file', 'public_key', 'private_key']
      for (const item of ACCOUNT_PROVIDER_ATTRS_MAP[provider].attrs) {
        fieldsObject[item] = {
          rules: updateNotRequiredFields.includes(item) && vm.object?.id ? [] : [RequiredChange]
        }
      }
      return fieldsObject
    }

    return {
      submitType: 'auto',
      settings: {
        url: `/api/v1/xpack/cloud/accounts/`,
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
          return newValues
        },
        addContinue: true
      }
    }
  },
  mounted() {
  },
  methods: {
    submitForm(form, btn, submitType) {
      form.validate((valid) => {
        if (valid) {
          btn.loading = true
        }
      })
      this.$refs.form.$refs.form.dataForm.submitForm('form', false)
      this.submitType = submitType
    },
    handleSubmitSuccess(res) {
      if (this.submitType === 'manual') {
        this.$emit('update:object', res)
        this.$emit('update:active', 3)
      }
    },
    handlePerformFinished() {
      for (const btn of this.settings.moreButtons) {
        btn.loading = false
      }
    }
  }
}
</script>

<style lang='scss' scoped>
::v-deep .el-form-item.form-buttons {
  text-align: right;
}
.form {
  margin-right: 0;
}
</style>
