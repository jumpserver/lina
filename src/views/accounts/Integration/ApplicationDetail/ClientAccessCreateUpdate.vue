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
    credential: { type: Object, required: true },
    configuration: { type: Object, default: null }
  },
  emits: ['saved', 'submitting'],
  data() {
    const item = this.configuration
    const applicationId =
      item?.application?.id ||
      (this.credential.applications?.length === 1 ? this.credential.applications[0].id : '')
    const accessType = item?.type || 'sdk'
    const buildCredentialsUrl = (id, type) => {
      if (!id) return ''
      const mode = type === 'sdk' ? `&mode=${this.credential.mode}` : ''
      return credentialUrl + `?fields_size=small&is_active=true&applications=${id}${mode}`
    }
    return {
      selectedApplicationId: applicationId,
      selectedAccessType: accessType,
      formConfig: {
        url: accessConfigurationUrl,
        getUrl: () => accessConfigurationUrl,
        submitMethod: item?.id ? 'patch' : 'post',
        needGetObjectDetail: false,
        hasReset: false,
        initial: {
          application_id: applicationId,
          name: item?.name || '',
          type: accessType,
          credential_ids: [...(item?.credential_ids || [this.credential.id])],
          language: item?.language || 'python',
          app_user: item?.app_user || '',
          install_path: item?.install_path || '/opt/jumpserver-pam',
          delivery_mode: item?.delivery_mode || 'json',
          systemd_unit: item?.systemd_unit || '',
          systemd_action: item?.systemd_action || 'restart',
          is_active: item?.is_active ?? true
        },
        fields: [
          [this.$t('Basic'), ['application_id', 'name', 'type', 'credential_ids']],
          [
            this.$t('Configuration'),
            [
              'language',
              'app_user',
              'install_path',
              'delivery_mode',
              'systemd_unit',
              'systemd_action'
            ]
          ],
          [this.$t('Other'), ['is_active']]
        ],
        fieldsMeta: {
          application_id: {
            label: this.$t('Application'),
            component: Select2,
            rules: [rules.RequiredChange],
            el: {
              multiple: false,
              disabled: Boolean(item?.id),
              options: (this.credential.applications || []).map((application) => ({
                label: application.name,
                value: application.id
              })),
              placeholder: this.$t('SelectApplications')
            },
            on: {
              change: ([value], updateForm) => {
                this.selectedApplicationId = value
                Object.assign(this.formConfig.fieldsMeta.credential_ids.el, {
                  url: buildCredentialsUrl(value, this.selectedAccessType),
                  disabled: !value
                })
                updateForm({ credential_ids: value ? [this.credential.id] : [] })
              }
            }
          },
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
            el: { disabled: !!item?.id },
            on: {
              change: ([value], updateForm) => {
                this.selectedAccessType = value
                this.formConfig.fieldsMeta.credential_ids.el.url = buildCredentialsUrl(
                  this.selectedApplicationId,
                  value
                )
                updateForm({ credential_ids: [this.credential.id] })
              }
            }
          },
          credential_ids: {
            label: this.$t('ApplicationCredentials'),
            component: Select2,
            rules: [rules.RequiredChange],
            helpText: this.$t('AccessCredentialSelectionHelp'),
            el: {
              multiple: true,
              disabled: !applicationId,
              disabledValues: [this.credential.id],
              url: buildCredentialsUrl(applicationId, accessType),
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
          delivery_mode: {
            label: this.$t('AgentDeliveryMode'),
            type: 'select',
            options: [
              { label: this.$t('AgentDeliveryJSON'), value: 'json' },
              { label: this.$t('AgentDeliveryEnvironment'), value: 'environment' },
              { label: this.$t('AgentDeliverySocket'), value: 'socket' }
            ],
            rules: [rules.RequiredChange],
            helpText: this.$t('AgentDeliveryModeHelp'),
            hidden: (form) => form.type !== 'agent'
          },
          systemd_unit: {
            label: this.$t('SystemdUnit'),
            rules: [rules.Required],
            el: { type: 'text', placeholder: 'my-application.service' },
            helpText: this.$t('SystemdUnitHelp'),
            hidden: (form) => form.type !== 'agent' || form.delivery_mode !== 'environment'
          },
          systemd_action: {
            label: this.$t('SystemdAction'),
            type: 'radio-group',
            options: [
              { label: this.$t('Reload'), value: 'reload' },
              { label: this.$t('Restart'), value: 'restart' }
            ],
            rules: [rules.RequiredChange],
            hidden: (form) => form.type !== 'agent' || form.delivery_mode !== 'environment'
          },
          is_active: { label: this.$t('IsActive'), type: 'checkbox' }
        },
        performSubmit: async (values) => {
          this.$emit('submitting', true)
          const save = saveClientAccessConfiguration
          try {
            const submit = (removalReason) =>
              save(
                { id: item?.application?.id || values.application_id },
                {
                  ...values,
                  id: item?.id,
                  removal_reason: removalReason
                }
              )
            let removalReason = await this.getRemovalReason(values)
            try {
              return await submit(removalReason)
            } catch (error) {
              const reasonRequired = error.response?.data?.removal_reason
              if (removalReason || !reasonRequired) throw error
              removalReason = await this.getRemovalReason(values, true)
              return await submit(removalReason)
            }
          } finally {
            this.$emit('submitting', false)
          }
        },
        onPerformSuccess: (saved, _method, _formVm, addContinue) => {
          this.$message.success(this.$t(addContinue ? 'SaveSuccessContinueMsg' : 'SaveSuccess'))
          this.$emit('saved', saved, addContinue)
        },
        onPerformError: (error, _method, formVm) => {
          const response = error.response
          if (response?.status === 400 && response.data) {
            formVm.$refs.form.setErrors({
              ...response.data,
              application_id: response.data.application || response.data.application_id,
              credential_ids: response.data.credentials || response.data.credential_ids
            })
          }
        }
      }
    }
  },
  methods: {
    async getRemovalReason(values, force = false) {
      const selected = new Set((values.credential_ids || []).map(String))
      const removed = (this.configuration?.credentials || []).filter(
        (credential) => !selected.has(String(credential.id))
      )
      const rotating = removed.filter((credential) => {
        const status = credential.status?.value ?? credential.status
        return status !== 'idle'
      })
      if (!force && !rotating.length) return ''

      const affected = rotating.length ? rotating : removed
      const names =
        affected.map((credential) => credential.name).join(', ') ||
        this.$t('ApplicationCredentials')
      const { value } = await this.$prompt(
        this.$t('RemoveRotatingCredentialWarning', { names }),
        this.$t('Warning'),
        {
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),
          inputType: 'textarea',
          inputPlaceholder: this.$t('PleaseEnterReason'),
          inputValidator: (reason) => Boolean(reason?.trim()) || this.$t('PleaseEnterReason')
        }
      )
      return value.trim()
    }
  }
}
</script>
