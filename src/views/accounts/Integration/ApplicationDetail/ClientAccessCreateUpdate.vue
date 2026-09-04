<template>
  <GenericCreateUpdatePage v-bind="formConfig" :title="null" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import rules from '@/components/Form/DataForm/rules'
import {
  accessConfigurationUrl,
  credentialUrl,
  saveClientAccessConfiguration
} from '@/api/applicationCredential'

export default {
  name: 'ClientAccessCreateUpdate',
  components: { GenericCreateUpdatePage },
  props: {
    application: { type: Object, required: true },
    configuration: { type: Object, default: null }
  },
  emits: ['cancel', 'saved', 'submitting'],
  data() {
    const item = this.configuration
    return {
      formConfig: {
        url: accessConfigurationUrl,
        getUrl: () => accessConfigurationUrl,
        submitMethod: item?.id ? 'patch' : 'post',
        needGetObjectDetail: false,
        hasReset: false,
        hasSaveContinue: false,
        submitBtnText: this.$t('Save'),
        initial: {
          name: item?.name || '',
          type: item?.type || 'sdk',
          credential_ids: [...(item?.credential_ids || [])],
          language: item?.language || 'python',
          app_user: item?.app_user || '',
          install_path: item?.install_path || '/opt/jumpserver-pam',
          is_active: item?.is_active ?? true
        },
        fields: [
          [this.$t('Basic'), ['name', 'type', 'credential_ids']],
          [this.$t('Configuration'), ['language', 'app_user', 'install_path']],
          [this.$t('Other'), ['is_active']]
        ],
        fieldsMeta: {
          name: {
            label: this.$t('Name'),
            rules: [rules.Required],
            el: { type: 'text', placeholder: this.$t('AccessConfigurationNameHelp') }
          },
          type: {
            label: this.$t('ClientType'),
            type: 'radio-group',
            options: [
              { label: this.$t('SDKAccess'), value: 'sdk' },
              { label: this.$t('AgentAccess'), value: 'agent' }
            ],
            rules: [rules.RequiredChange],
            el: { disabled: !!item?.id }
          },
          credential_ids: {
            label: this.$t('ApplicationCredentials'),
            component: Select2,
            rules: [rules.RequiredChange],
            helpText: this.$t('AccessCredentialSelectionHelp'),
            el: {
              multiple: true,
              url: credentialUrl + '?fields_size=small&is_active=true',
              placeholder: this.$t('SelectApplicationCredentials')
            }
          },
          language: {
            label: this.$t('Language'),
            type: 'select',
            options: [{ label: 'Python', value: 'python' }],
            rules: [rules.RequiredChange],
            hidden: (form) => form.type !== 'sdk'
          },
          app_user: {
            label: this.$t('ApplicationRunUser'),
            rules: [rules.Required],
            el: { type: 'text', placeholder: 'app-user' },
            hidden: (form) => form.type !== 'agent'
          },
          install_path: {
            label: this.$t('InstallPath'),
            rules: [rules.Required],
            el: { type: 'text', placeholder: '/opt/jumpserver-pam' },
            hidden: (form) => form.type !== 'agent'
          },
          is_active: { label: this.$t('IsActive'), type: 'checkbox' }
        },
        moreButtons: [{ title: this.$t('Cancel'), callback: () => this.$emit('cancel') }],
        performSubmit: (values) => {
          this.$emit('submitting', true)
          return saveClientAccessConfiguration(this.application, {
            ...values,
            id: item?.id
          }).finally(() => this.$emit('submitting', false))
        },
        onPerformSuccess: (saved) => {
          this.$message.success(this.$t('SaveSuccess'))
          this.$emit('saved', saved)
        },
        onPerformError: (error, _method, formVm) => {
          const response = error.response
          if (response?.status === 400 && response.data) {
            formVm.$refs.form.setErrors({
              ...response.data,
              credential_ids: response.data.credentials || response.data.credential_ids
            })
          }
        }
      }
    }
  }
}
</script>
