<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { Select2 } from '@/components/Form/FormFields'
import { GenericCreateUpdatePage } from '@/layout/components'
import SecretInput from './SecretInput.vue'

export default {
  name: 'PersonalCredentialCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    const secretInputContext = {
      secretType: 'password'
    }
    return {
      currentVersion: null,
      secretInputContext,
      config: {
        url: '/api/v1/accounts/personal-asset-credentials/',
        initial: {
          secret_type: 'password'
        },
        fields: [
          [this.$t('Basic'), ['asset', 'username', 'secret_type', 'protocol']],
          [this.$t('Secret'), ['secret']],
          [this.$t('Other'), ['comment']]
        ],
        fieldsMeta: {
          asset: {
            component: Select2,
            el: {
              multiple: false,
              ajax: {
                url: '/api/v1/perms/users/self/assets/',
                transformOption: (item) => ({
                  label: item.address ? `${item.name} (${item.address})` : item.name,
                  value: item.id
                })
              }
            }
          },
          secret_type: {
            on: {
              change: ([value]) => {
                secretInputContext.secretType = value
              }
            }
          },
          secret: {
            component: SecretInput,
            required: true,
            helpText: this.$t('PersonalCredentialSecretUpdateTip'),
            helpTextAsTip: false,
            rules: [
              {
                trigger: ['blur', 'change'],
                validator(rule, value, callback) {
                  if (vm.currentVersion === null && !value) {
                    callback(new Error(vm.$t('FieldRequiredError')))
                    return
                  }
                  callback()
                }
              }
            ],
            el: {
              autocomplete: 'new-password',
              context: secretInputContext
            }
          },
          comment: {
            el: {
              type: 'textarea'
            }
          }
        },
        encryptedFields: ['secret'],
        hasDetailInMsg: false,
        hasSaveContinue: false,
        submitMethod: (form) => (form.action === 'update' ? 'patch' : 'post'),
        afterGetFormValue(value) {
          vm.currentVersion = value.version ?? null
          secretInputContext.secretType =
            value.secret_type?.value || value.secret_type || 'password'
          const isUpdate = vm.currentVersion !== null
          const asset = value.asset
          const assetId = asset?.id || asset?.value
          const assetName = asset?.name || asset?.label || assetId
          const assetLabel = asset?.address ? `${assetName} (${asset.address})` : assetName
          vm.config.fieldsMeta.asset.el = {
            ...vm.config.fieldsMeta.asset.el,
            disabled: isUpdate,
            ...(isUpdate && assetId
              ? {
                  ajax: {},
                  clearable: false,
                  options: [{ label: assetLabel, value: assetId }]
                }
              : {})
          }
          vm.config.fieldsMeta.secret.required = !isUpdate
          vm.config.fieldsMeta.protocol = {
            ...vm.config.fieldsMeta.protocol,
            el: {
              ...vm.config.fieldsMeta.protocol?.el,
              disabled: isUpdate
            }
          }
          return {
            ...value,
            secret: ''
          }
        },
        cleanFormValue(value) {
          const payload = { ...value }
          if (!payload.secret) {
            delete payload.secret
          }
          if (vm.currentVersion !== null) {
            delete payload.asset
            delete payload.protocol
            payload.expected_version = vm.currentVersion
          }
          return payload
        }
      }
    }
  }
}
</script>
