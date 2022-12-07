<template>
  <AutoDataForm
    v-bind="$data"
    @submit="confirm"
    @afterRemoteMeta="afterGetRemoteMeta"
  />
</template>

<script>
import AutoDataForm from '@/components/AutoDataForm'
import { UpdateToken } from '@/components/FormFields'
import { getUpdateObjURL } from '@/utils/common'
export default {
  name: 'AccountCreateForm',
  components: {
    AutoDataForm
  },
  props: {
    platform: {
      type: Object,
      required: true
    },
    account: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      usernameChanged: false,
      url: '/api/v1/assets/accounts/',
      form: this.account || {},
      fields: [
        [this.$t('common.Basic'), ['name', 'username', 'privileged', 'su_from']],
        [this.$t('assets.Secret'), ['secret_type', 'secret', 'ssh_key', 'token', 'api_key', 'passphrase']],
        [this.$t('common.Other'), ['push_now', 'comment']]
      ],
      defaultPrivilegedAccounts: ['root', 'administrator'],
      fieldsMeta: {
        name: {
          on: {
            input: ([value], updateForm) => {
              if (!this.usernameChanged) {
                updateForm({ username: value })
              }
            }
          }
        },
        username: {
          on: {
            input: ([value], updateForm) => {
              this.usernameChanged = true
            },
            change: ([value], updateForm) => {
              if (this.defaultPrivilegedAccounts.indexOf(value.toLowerCase()) > -1) {
                updateForm({ privileged: true })
              }
            }
          }
        },
        su_from: {
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: `/api/v1/assets/accounts/${this.account.id}/su-from-accounts/`,
              transformOption: (item) => {
                return { label: `${item.name}(${item.username})`, value: item.id }
              }
            }
          }
        },
        secret: {
          label: this.$t('assets.Password'),
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'password'
        },
        ssh_key: {
          component: UpdateToken,
          label: this.$t('assets.PrivateKey'),
          el: {
            type: 'textarea',
            showInput: true,
            clearInfoObj: {}
          },
          hidden: (formValue) => formValue.secret_type !== 'ssh_key'
        },
        passphrase: {
          label: 'Passphrase',
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'ssh_key'
        },
        token: {
          label: 'Token',
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'token'
        },
        api_key: {
          id: 'api_key',
          label: this.$t('assets.SecretKey'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'api_key'
        },
        secret_type: {
          type: 'radio-group',
          options: []
        },
        push_now: {
          hidden: () => {
            return !this.platform.automation?.['push_account_enabled']
          }
        }
      },
      hasSaveContinue: false
    }
  },
  methods: {
    afterGetRemoteMeta(meta) {
      const choices = meta.secret_type.choices
      const secretTypes = []
      this.platform.protocols?.forEach(p => {
        secretTypes.push(...p['secret_types'])
      })
      if (!this.form.secret_type) {
        this.form.secret_type = secretTypes[0]
      }
      this.fieldsMeta.secret_type.options = choices.filter(item => {
        return secretTypes.indexOf(item.value) > -1
      })
      if (this.form.specific?.ssh_key_fingerprint) {
        const url = getUpdateObjURL('/api/v1/assets/accounts/', this.form.id)
        this.fieldsMeta.ssh_key.el.showInput = false
        this.fieldsMeta.ssh_key.el.clearInfoObj = {
          url: url, showClearButton: true, clearFields: ['secret']
        }
      }
    },
    confirm(form) {
      const secretType = form.secret_type || ''
      if (secretType !== 'password') {
        form.secret = form[secretType]
        delete form[secretType]
      }
      if (this.account?.name) {
        this.$emit('edit', form)
      } else {
        this.$emit('add', form)
      }
    }
  }
}
</script>

<style scoped>
</style>
