<template>
  <GenericCreateUpdatePage v-bind="formConfig" :title="null" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import rules from '@/components/Form/DataForm/rules'
import { credentialUrl, saveApplicationCredential } from '@/api/applicationCredential'

const isRotation = (form) => form.mode === 'alternating_rotation'

export default {
  name: 'ApplicationCredentialCreateUpdate',
  components: { GenericCreateUpdatePage },
  props: {
    credential: { type: Object, default: null }
  },
  emits: ['cancel', 'saved'],
  data() {
    const item = this.credential
    const assetId = item?.asset?.id || ''
    const accountUrl = assetId
      ? `/api/v1/accounts/accounts/?asset_id=${assetId}&fields_size=small`
      : ''
    const fieldsMeta = {
      name: {
        label: this.$t('Name'),
        rules: [rules.Required],
        el: { type: 'text', placeholder: this.$t('CredentialNamePlaceholder') }
      },
      mode: {
        label: this.$t('CredentialPolicyMode'),
        type: 'radio-group',
        rules: [rules.RequiredChange],
        options: [
          { label: this.$t('CredentialUpdateSubscription'), value: 'subscription' },
          { label: this.$t('AlternatingAccountRotation'), value: 'alternating_rotation' }
        ],
        helpTextFormatter: () =>
          this.$t(
            this.currentMode === 'subscription'
              ? 'CredentialUpdateSubscriptionHelp'
              : 'AlternatingAccountRotationHelp'
          ),
        on: {
          change: ([value]) => (this.currentMode = value)
        },
        el: { disabled: !!item?.id }
      },
      asset_id: {
        label: this.$t('Asset'),
        component: Select2,
        rules: [rules.RequiredChange],
        hidden: (form) => !isRotation(form),
        el: {
          multiple: false,
          url: '/api/v1/assets/assets/?fields_size=small',
          placeholder: this.$t('SelectAsset')
        },
        on: {
          change: ([value], updateForm) => {
            const url = value
              ? `/api/v1/accounts/accounts/?asset_id=${value}&fields_size=small`
              : ''
            for (const name of ['account_id', 'alternate_account_id']) {
              Object.assign(this.formConfig.fieldsMeta[name].el, { url, disabled: !value })
            }
            this.formConfig.fieldsMeta.alternate_account_id.el.disabledValues = []
            updateForm({ account_id: '', alternate_account_id: '' })
          }
        }
      },
      account_id: {
        label: this.$t('Account'),
        component: Select2,
        rules: [rules.RequiredChange],
        hidden: (form) => !isRotation(form),
        el: {
          multiple: false,
          disabled: !assetId,
          url: accountUrl,
          placeholder: this.$t('SelectAccount')
        },
        on: {
          change: ([value]) => {
            this.formConfig.fieldsMeta.alternate_account_id.el.disabledValues = value ? [value] : []
          }
        }
      },
      alternate_account_id: {
        label: this.$t('AlternateAccount'),
        component: Select2,
        rules: [
          rules.RequiredChange,
          {
            validator: (_rule, value, callback) => {
              const sameAccount =
                value && fieldsMeta.alternate_account_id.el.disabledValues.includes(value)
              callback(
                sameAccount ? new Error(this.$t('AlternatingAccountsMustDiffer')) : undefined
              )
            },
            trigger: 'change'
          }
        ],
        hidden: (form) => !isRotation(form),
        el: {
          multiple: false,
          disabled: !assetId,
          url: accountUrl,
          disabledValues: item?.account?.id ? [item.account.id] : [],
          placeholder: this.$t('SelectAlternateAccount')
        }
      },
      application_ids: {
        label: this.$t('Applications'),
        component: Select2,
        rules: [rules.RequiredChange],
        helpTextFormatter: () =>
          this.$t(
            this.currentMode === 'subscription'
              ? 'CredentialSubscriptionApplicationsHelp'
              : 'CredentialPolicyApplicationsHelp'
          ),
        el: {
          multiple: true,
          url: '/api/v1/accounts/integration-applications/?fields_size=small&is_active=true',
          placeholder: this.$t('SelectApplications')
        }
      },
      is_active: { label: this.$t('IsActive'), type: 'checkbox' },
      comment: { label: this.$t('Comment'), el: { type: 'textarea', rows: 3 } }
    }
    return {
      currentMode: item?.mode || 'subscription',
      formConfig: {
        url: credentialUrl,
        getUrl: () => credentialUrl,
        submitMethod: item?.id ? 'patch' : 'post',
        needGetObjectDetail: false,
        hasReset: false,
        hasSaveContinue: false,
        submitBtnText: this.$t('Save'),
        initial: {
          name: item?.name || '',
          mode: item?.mode || 'subscription',
          asset_id: assetId,
          account_id: item?.account?.id || '',
          alternate_account_id: item?.alternate_account?.id || '',
          application_ids: (item?.applications || []).map((application) => application.id),
          is_active: item?.is_active ?? true,
          comment: item?.comment || ''
        },
        fields: [
          [this.$t('Basic'), ['name', 'mode']],
          [this.$t('AccountConfiguration'), ['asset_id', 'account_id', 'alternate_account_id']],
          [this.$t('ApplicationBinding'), ['application_ids']],
          [this.$t('Other'), ['is_active', 'comment']]
        ],
        fieldsMeta,
        moreButtons: [{ title: this.$t('Cancel'), callback: () => this.$emit('cancel') }],
        performSubmit: (values) => saveApplicationCredential({ ...values, id: item?.id }),
        onPerformSuccess: (saved) => {
          this.$message.success(this.$t('SaveSuccess'))
          this.$emit('saved', saved)
        },
        onPerformError: (error, _method, formVm) => {
          const response = error.response
          if (response?.status === 400 && response.data) {
            formVm.$refs.form.setErrors({
              ...response.data,
              account_id: response.data.account,
              alternate_account_id: response.data.alternate_account,
              application_ids: response.data.applications
            })
          }
        }
      }
    }
  }
}
</script>
