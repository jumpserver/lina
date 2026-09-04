<template>
  <GenericCreateUpdatePage v-bind="formConfig" :title="null" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import rules from '@/components/Form/DataForm/rules'
import { credentialUrl, saveApplicationCredential } from '@/api/applicationCredential'

const isDual = (form) => form.type === 'rotation' && form.rotation_mode === 'dual'

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
      type: {
        label: this.$t('CredentialType'),
        type: 'radio-group',
        rules: [rules.RequiredChange],
        options: [
          { label: this.$t('FixedAccount'), value: 'fixed' },
          { label: this.$t('AccountRotation'), value: 'rotation' }
        ],
        helpTextFormatter: () =>
          this.$t(this.currentType === 'fixed' ? 'FixedAccountHelp' : 'RotationAccountHelp'),
        on: {
          change: ([value], updateForm) => {
            this.currentType = value
            if (value === 'fixed') updateForm({ rotation_mode: 'single' })
          }
        }
      },
      rotation_mode: {
        label: this.$t('RotationMode'),
        type: 'radio-group',
        rules: [rules.RequiredChange],
        options: [
          { label: this.$t('SingleAccountRotation'), value: 'single' },
          { label: this.$t('DualAccountRotation'), value: 'dual' }
        ],
        helpText: this.$t('ManualRotationHelp'),
        hidden: (form) => form.type !== 'rotation'
      },
      asset_id: {
        label: this.$t('Asset'),
        component: Select2,
        rules: [rules.RequiredChange],
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
            for (const name of ['account_id', 'primary_account_id', 'backup_account_id']) {
              Object.assign(this.formConfig.fieldsMeta[name].el, { url, disabled: !value })
            }
            this.formConfig.fieldsMeta.backup_account_id.el.disabledValues = []
            updateForm({ account_id: '', primary_account_id: '', backup_account_id: '' })
          }
        }
      },
      account_id: {
        label: this.$t('Account'),
        component: Select2,
        rules: [rules.RequiredChange],
        hidden: isDual,
        el: {
          multiple: false,
          disabled: !assetId,
          url: accountUrl,
          placeholder: this.$t('SelectAccount')
        }
      },
      primary_account_id: {
        label: this.$t('PrimaryAccount'),
        component: Select2,
        rules: [rules.RequiredChange],
        hidden: (form) => !isDual(form),
        el: {
          multiple: false,
          disabled: !assetId,
          url: accountUrl,
          placeholder: this.$t('SelectPrimaryAccount')
        },
        on: {
          change: ([value]) => {
            this.formConfig.fieldsMeta.backup_account_id.el.disabledValues = value ? [value] : []
          }
        }
      },
      backup_account_id: {
        label: this.$t('BackupAccount'),
        component: Select2,
        rules: [
          rules.RequiredChange,
          {
            validator: (_rule, value, callback) => {
              const sameAccount =
                value && fieldsMeta.backup_account_id.el.disabledValues.includes(value)
              callback(sameAccount ? new Error(this.$t('PrimaryBackupMustDiffer')) : undefined)
            },
            trigger: 'change'
          }
        ],
        hidden: (form) => !isDual(form),
        el: {
          multiple: false,
          disabled: !assetId,
          url: accountUrl,
          disabledValues: item?.primary_account?.id ? [item.primary_account.id] : [],
          placeholder: this.$t('SelectBackupAccount')
        }
      },
      is_active: { label: this.$t('IsActive'), type: 'checkbox' },
      comment: { label: this.$t('Comment'), el: { type: 'textarea', rows: 3 } }
    }
    return {
      currentType: item?.type || 'fixed',
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
          type: item?.type || 'fixed',
          rotation_mode: item?.rotation_mode || 'single',
          asset_id: assetId,
          account_id: item?.primary_account?.id || '',
          primary_account_id: item?.primary_account?.id || '',
          backup_account_id: item?.backup_account?.id || '',
          is_active: item?.is_active ?? true,
          comment: item?.comment || ''
        },
        fields: [
          [this.$t('Basic'), ['name', 'type', 'rotation_mode']],
          [
            this.$t('Accounts'),
            ['asset_id', 'account_id', 'primary_account_id', 'backup_account_id']
          ],
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
              account_id: response.data.primary_account,
              primary_account_id: response.data.primary_account,
              backup_account_id: response.data.backup_account
            })
          }
        }
      }
    }
  }
}
</script>
