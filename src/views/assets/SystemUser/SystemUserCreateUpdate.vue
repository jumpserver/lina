<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import UploadKey from '@/components/UploadKey'
import { Select2 } from '@/components'

// const asciiProtocols = ['ssh', 'telnet', 'mysql']
const graphProtocols = ['vnc', 'rdp', 'k8s']

export default {
  name: 'SystemUserCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        login_mode: 'auto',
        priority: '20',
        protocol: 'ssh',
        username_same_with_user: false,
        auto_generate_key: true,
        auto_push: true,
        sftp_root: 'tmp',
        sudo: '/bin/whoami',
        shell: '/bin/bash'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'login_mode', 'username', 'username_same_with_user', 'priority', 'protocol']],
        [this.$t('common.Auth'), ['auto_push', 'auto_generate_key', 'password', 'private_key', 'token']],
        [this.$t('common.Command filter'), ['cmd_filters']],
        [this.$t('common.Other'), ['sftp_root', 'sudo', 'shell', 'comment']]
      ],
      fieldsMeta: {
        login_mode: {
          helpText: this.$t('assets.LoginModeHelpMessage'),
          hidden: (form) => {
            if (form.protocol === 'k8s') {
              return true
            }
          }
        },
        username: {
          el: {
            disabled: false
          },
          rules: [{ required: false }],
          hidden: (form) => {
            if (form.protocol === 'k8s') {
              this.fieldsMeta.username.rules[0].required = true
            } else {
              this.fieldsMeta.username.rules[0].required = false
            }
          }
        },
        private_key: {
          component: UploadKey,
          hidden: (form) => {
            if (form.login_mode !== 'auto') {
              return true
            }
            if (form.protocol === 'k8s') {
              return true
            }
            return form.auto_generate_key === true
          }
        },
        username_same_with_user: {
          type: 'switch',
          helpText: this.$t('assets.UsernameHelpMessage'),
          hidden: (form) => {
            this.fieldsMeta.username.el.disabled = form.username_same_with_user
            if (form.protocol === 'k8s') {
              return true
            }
            return false
          }
        },
        auto_generate_key: {
          type: 'switch',
          label: this.$t('assets.AutoGenerateKey'),
          hidden: form => {
            if (JSON.stringify(this.$route.params) !== '{}') {
              return true
            }
            if (form.login_mode !== 'auto') {
              return true
            }
            if (form.protocol === 'k8s') {
              return true
            }
          }
        },
        token: {
          rules: [
            { required: true }
          ],
          el: {
            type: 'password'
          },
          hidden: form => form.protocol !== 'k8s'
        },
        protocol: {
          rules: [
            { required: true }
          ],
          el: {
            style: 'width:100%'
          }
        },
        cmd_filters: {
          component: Select2,
          hidden: (form) => graphProtocols.indexOf(form.protocol) !== -1,
          el: {
            multiple: true,
            value: [],
            ajax: {
              url: '/api/v1/assets/cmd-filters/'
            }
          }
        },
        priority: {
          rules: [
            { required: true }
          ],
          helpText: this.$t('assets.PriorityHelpMessage')
        },
        auto_push: {
          type: 'switch',
          hidden: form => {
            if (form.login_mode !== 'auto') {
              return true
            }
            if (form.protocol === 'k8s') {
              return true
            }
          }
        },
        sftp_root: {
          rules: [
            { required: true }
          ],
          helpText: this.$t('assets.SFTPHelpMessage'),
          hidden: (item) => item.protocol !== 'ssh'
        },
        sudo: {
          rules: [
            { required: true }
          ],
          helpText: this.$t('assets.SudoHelpMessage'),
          hidden: (item) => item.protocol !== 'ssh'
        },
        password: {
          helpText: this.$t('assets.PasswordHelpMessage'),
          hidden: form => {
            if (form.login_mode !== 'auto') {
              return true
            }
            if (form.protocol === 'k8s') {
              return true
            }
            return form.auto_generate_key === true
          }
        },
        shell: {
          hidden: (item) => item.protocol !== 'ssh',
          rules: [
            { required: true }
          ]
        }
      },
      url: '/api/v1/assets/system-users/',
      authHiden: false
    }
  },
  computed: {

  }
}
</script>

<style lang='less' scoped>

</style>
