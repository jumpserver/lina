<template>
  <GenericCreateUpdatePage v-bind="formConfig" :title="null" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import rules from '@/components/Form/DataForm/rules'
import { credentialUrl, saveApplicationCredential } from '@/api/applicationCredential'
import { subscribedAccountLabel } from './components/subscriptionAccount.js'

const isRotation = (form) => form.mode === 'alternating_rotation'
const rotationAccountUrl = (applicationIds) =>
  applicationIds.length
    ? `/api/v1/accounts/accounts/?fields=id,name,username,asset&integrationapplications=${applicationIds.join(',')}`
    : ''

export default {
  name: 'ApplicationCredentialCreateUpdate',
  components: { GenericCreateUpdatePage },
  props: {
    credential: { type: Object, default: null },
    mode: { type: String, default: 'alternating_rotation' }
  },
  emits: ['cancel', 'saved'],
  data() {
    const item = this.credential
    const applicationIds = (item?.applications || []).map((application) => application.id)
    const accountUrl = rotationAccountUrl(applicationIds)
    const accounts = new Map(
      [item?.account, item?.alternate_account]
        .filter(Boolean)
        .map((account) => [account.id, account])
    )
    const selectedIds = [item?.account?.id || '', item?.alternate_account?.id || '']
    const crossAssetHelp = () => {
      const [first, second] = selectedIds.map((id) => accounts.get(id)?.asset?.id)
      return first && second && first !== second ? `!${this.$t('RotationCrossAssetWarning')}` : ''
    }
    const accountAjax = {
      transformOption: (account) => {
        accounts.set(account.id, account)
        return { label: subscribedAccountLabel(account), value: account.id }
      }
    }
    const fieldsMeta = {
      name: {
        label: this.$t('Name'),
        rules: [rules.Required],
        el: { type: 'text' }
      },
      mode: {
        hidden: true,
        label: this.$t('CredentialPolicyMode'),
        type: 'radio-group',
        rules: [rules.RequiredChange],
        options: [{ label: this.$t('AlternatingAccountRotation'), value: 'alternating_rotation' }],
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
      account_id: {
        label: this.$t('Account'),
        component: Select2,
        rules: [rules.RequiredChange],
        hidden: (form) => !isRotation(form),
        helpText: this.$t('RotationAccountsHelp'),
        el: {
          multiple: false,
          disabled: !applicationIds.length,
          url: accountUrl,
          ajax: accountAjax,
          placeholder: this.$t('SelectAccount')
        },
        on: {
          change: ([value]) => {
            selectedIds[0] = value
            this.formConfig.fieldsMeta.alternate_account_id.el.disabledValues = value ? [value] : []
            this.formConfig.fieldsMeta.alternate_account_id.helpText = crossAssetHelp()
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
        helpText: crossAssetHelp(),
        el: {
          multiple: false,
          disabled: !applicationIds.length,
          url: accountUrl,
          ajax: accountAjax,
          disabledValues: item?.account?.id ? [item.account.id] : [],
          placeholder: this.$t('SelectAlternateAccount')
        },
        on: {
          change: ([value]) => {
            selectedIds[1] = value
            this.formConfig.fieldsMeta.alternate_account_id.helpText = crossAssetHelp()
          }
        }
      },
      verify_before_switch: {
        label: this.$t('VerifyBeforeSwitch'),
        type: 'checkbox',
        hidden: (form) => !isRotation(form),
        helpText: this.$t('VerifyBeforeSwitchHelp')
      },
      source_no_traffic_days: {
        label: this.$t('SourceNoTrafficDays'),
        hidden: (form) => !isRotation(form),
        rules: [
          rules.Required,
          {
            validator: (_rule, value, callback) =>
              callback(
                Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 3650
                  ? undefined
                  : new Error(this.$t('StandbyNoTrafficDaysValidation'))
              ),
            trigger: 'blur'
          }
        ],
        el: { type: 'number', min: 1, max: 3650, step: 1 },
        helpText: this.$t('SourceNoTrafficDaysHelp')
      },
      subscription_account_ids: {
        label: this.$t('SubscribedAccounts'),
        component: Select2,
        rules: [rules.RequiredChange],
        hidden: (form) => isRotation(form) || form.subscription_all_authorized,
        helpTextFormatter: () => this.$t('SubscribedAccountsHelp'),
        el: {
          multiple: true,
          url: '/api/v1/accounts/accounts/?fields=id,name,username,asset',
          ajax: {
            transformOption: (account) => ({
              label: subscribedAccountLabel(account),
              value: account.id
            })
          },
          placeholder: this.$t('SelectSubscribedAccounts')
        }
      },
      subscription_all_authorized: {
        label: this.$t('AllApplicationAccounts'),
        type: 'checkbox',
        hidden: (form) => isRotation(form),
        helpText: this.$t('AllApplicationAccountsHelp'),
        on: { change: ([value]) => (this.allAccounts = value) }
      },
      application_ids: {
        label: this.$t('Applications'),
        component: Select2,
        rules: [rules.RequiredChange],
        helpTextFormatter: () =>
          this.$t(
            this.currentMode === 'subscription'
              ? this.allAccounts
                ? 'AllApplicationAccountsHelp'
                : 'CredentialSubscriptionApplicationsHelp'
              : 'CredentialPolicyApplicationsHelp'
          ),
        el: {
          multiple: true,
          url: '/api/v1/accounts/integration-applications/?fields_size=small&is_active=true',
          placeholder: this.$t('SelectApplications')
        },
        on: {
          change: ([value], updateForm) => {
            if (this.currentMode !== 'alternating_rotation') return
            const url = rotationAccountUrl(value)
            for (const name of ['account_id', 'alternate_account_id']) {
              Object.assign(this.formConfig.fieldsMeta[name].el, { url, disabled: !value.length })
            }
            selectedIds.fill('')
            this.formConfig.fieldsMeta.alternate_account_id.el.disabledValues = []
            this.formConfig.fieldsMeta.alternate_account_id.helpText = ''
            updateForm({ account_id: '', alternate_account_id: '' })
          }
        }
      },
      is_active: { label: this.$t('IsActive'), type: 'checkbox' },
      comment: { label: this.$t('Comment'), el: { type: 'textarea', rows: 3 } }
    }
    return {
      currentMode: item?.mode || this.mode,
      allAccounts: item?.subscription_all_authorized ?? false,
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
          mode: item?.mode || this.mode,
          account_id: item?.account?.id || '',
          alternate_account_id: item?.alternate_account?.id || '',
          verify_before_switch: item?.verify_before_switch ?? true,
          source_no_traffic_days: item?.source_no_traffic_days ?? 7,
          subscription_account_ids: (item?.subscription_accounts || []).map(
            (account) => account.id
          ),
          subscription_all_authorized: item?.subscription_all_authorized ?? false,
          application_ids: applicationIds,
          is_active: item?.is_active ?? true,
          comment: item?.comment || ''
        },
        fields: [
          [this.$t('Basic'), ['name', 'mode']],
          [this.$t('ApplicationBinding'), ['application_ids']],
          [
            this.$t('AccountConfiguration'),
            [
              'account_id',
              'alternate_account_id',
              'verify_before_switch',
              'source_no_traffic_days',
              'subscription_all_authorized',
              'subscription_account_ids'
            ]
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
              account_id: response.data.account,
              alternate_account_id: response.data.alternate_account,
              subscription_account_ids: response.data.subscription_accounts,
              application_ids: response.data.applications
            })
          }
        }
      }
    }
  }
}
</script>
