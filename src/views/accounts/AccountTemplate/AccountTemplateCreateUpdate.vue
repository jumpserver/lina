<template>
  <GenericCreateUpdatePage v-bind="$data" @get-object-done="getObjectDone" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { templateFields, templateFieldsMeta } from './const.js'
import { encryptPassword } from '@/utils/secure'

const typedSecretFields = ['ssh_key', 'token', 'access_key', 'api_key']

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    const isUpdate = vm.$route.path.indexOf('/update') > -1 && vm.$route.params?.id
    const formFields = templateFields(vm)
    for (const [key, value] of formFields) {
      if (key === vm.$t('Secret')) {
        isUpdate && value.push('is_sync_account')
      }
    }
    return {
      initial: {
        secret_type: 'password',
        push_params: {}
      },
      url: '/api/v1/accounts/account-templates/',
      hasDetailInMsg: false,
      fields: formFields,
      fieldsMeta: {
        ...templateFieldsMeta(vm),
        is_sync_account: {
          label: this.$t('SyncUpdateAccountInfo'),
          el: {
            icon: 'fa fa-external-link',
            type: 'primary',
            size: 'small'
          },
          component: 'el-button',
          on: {
            click: () => {
              vm.$router.push({
                name: 'AccountTemplateDetail',
                query: {
                  tab: 'Account'
                }
              })
            }
          }
        }
      },
      cleanFormValue(value) {
        const isRandomSecret = value.secret_strategy === 'random'
        const typedSecretField = typedSecretFields.includes(value.secret_type)
          ? value.secret_type
          : null

        if (isRandomSecret) {
          delete value.secret
        } else if (typedSecretField) {
          value.secret = value[typedSecretField]
        }

        typedSecretFields.forEach((field) => delete value[field])

        if (value.secret) {
          value.secret = encryptPassword(value.secret)
        } else {
          delete value.secret
        }

        if (value.secret_type !== 'ssh_key' || isRandomSecret) {
          delete value.passphrase
        }
        if (value.secret_type !== 'password' || !isRandomSecret) {
          delete value.password_rules
        }

        delete value.is_sync_account
        return value
      },
      createSuccessNextRoute: { name: 'AccountTemplateList' },
      updateSuccessNextRoute: { name: 'AccountTemplateList' }
    }
  },
  async mounted() {
    this.setSecretTypeOptions()
  },
  methods: {
    setSecretTypeOptions() {
      const choices = [
        {
          label: this.$t('Password'),
          value: 'password'
        },
        {
          label: this.$t('SSHKey'),
          value: 'ssh_key'
        },
        {
          label: this.$t('Token'),
          value: 'token'
        },
        {
          label: this.$t('AccessKey'),
          value: 'access_key'
        },
        {
          label: this.$t('ApiKey'),
          value: 'api_key'
        }
      ]
      this.fieldsMeta.secret_type.options = choices
    },
    getObjectDone(obj) {
      if (['token', 'access_key', 'api_key'].includes(obj.secret_type.value)) {
        this.fieldsMeta.auto_push.el.disabled = true
      }
    }
  }
}
</script>
