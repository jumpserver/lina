<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { Required } from '@/components/DataForm/rules'

// const asciiProtocols = ['ssh', 'telnet', 'mysql']

export default {
  name: 'SystemUserCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        login_mode: 'auto',
        protocol: this.$route.query.protocol,
        username_same_with_user: false
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'login_mode', 'username', 'username_same_with_user', 'priority', 'protocol']],
        [this.$t('common.Auth'), ['update_password', 'password']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        login_mode: {
          helpText: this.$t('assets.LoginModeHelpMessage')
        },
        username: {
          el: {
            disabled: false
          },
          rules: [Required],
          hidden: (form) => {
            if (form.login_mode === 'auto') {
              this.fieldsMeta.username.rules = [Required]
            } else {
              this.fieldsMeta.username.rules[0].required = false
            }
            if (!form.username_same_with_user) {
              this.fieldsMeta.username.rules = [Required]
            } else {
              this.fieldsMeta.username.rules[0].required = false
            }
          }
        },
        username_same_with_user: {
          type: 'switch',
          helpText: this.$t('assets.UsernameHelpMessage'),
          hidden: (form) => {
            this.fieldsMeta.username.el.disabled = form.username_same_with_user
          },
          el: {
            disabled: false
          }
        },
        protocol: {
          rules: [Required],
          el: {
            disabled: true,
            style: 'width:100%'
          },
          on: {
            input: ([value], updateForm) => {
              if (['ssh', 'rdp'].indexOf(value) === -1) {
                updateForm({ auto_push: false })
                updateForm({ auto_generate_key: false })
              }
            }
          }
        },
        update_password: {
          label: this.$t('users.UpdatePassword'),
          type: 'checkbox',
          hidden: (formValue) => {
            if (formValue.update_password || formValue.protocol === 'k8s') {
              return true
            }
            if (formValue.login_mode === 'manual') {
              return true
            }
            return !this.$route.params.id
          }
        },
        password: {
          helpText: this.$t('assets.PasswordHelpMessage'),
          hidden: form => {
            if (form.login_mode !== 'auto' || form.protocol === 'k8s' || form.auto_generate_key) {
              return true
            }
            if (!this.$route.params.id) {
              return false
            }
            return !form.update_password
          }
        }
      },
      url: '/api/v1/assets/system-users/',
      authHiden: false
    }
  },
  method: {

  },
  mounted() {
    const params = this.$route.params
    const method = params.id ? 'update' : 'create'
    if (method === 'update') {
      this.fieldsMeta.username_same_with_user.el.disabled = true
    }
  }
}
</script>

<style lang='less' scoped>

</style>
