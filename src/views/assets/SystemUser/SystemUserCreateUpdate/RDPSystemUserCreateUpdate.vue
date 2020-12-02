<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import UploadKey from '@/components/UploadKey'
import { Select2 } from '@/components'
import { Required } from '@/components/DataForm/rules'

export default {
  name: 'SystemUserCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        login_mode: 'auto',
        priority: '20',
        protocol: 'rdp',
        username_same_with_user: false,
        auto_generate_key: false,
        auto_push: false,
        sftp_root: 'tmp',
        sudo: '/bin/whoami',
        shell: '/bin/bash'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'login_mode', 'username', 'username_same_with_user', 'priority', 'protocol']],
        [this.$t('assets.AutoPush'), ['auto_push', 'sudo', 'shell', 'home', 'system_groups']],
        [this.$t('common.Auth'), ['auto_generate_key', 'update_password', 'password', 'private_key', 'ad_domain']],
        [this.$t('common.Command filter'), ['cmd_filters']],
        [this.$t('common.Other'), ['sftp_root', 'comment']]
      ],
      fieldsMeta: {
        login_mode: {
          helpText: this.$t('assets.LoginModeHelpMessage'),
          hidden: (form) => {
            if (form.protocol === 'k8s') {
              return true
            }
          },
          on: {
            input: ([value], updateForm) => {
              if (value === 'manual') {
                updateForm({ auto_push: false })
                updateForm({ auto_generate_key: false })
              }
            }
          }
        },
        username: {
          el: {
            disabled: false
          },
          on: {
            input: ([value], updateForm) => {
              updateForm({ home: `/home/${value}` })
            }
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
            if (['mysql', 'postgresql', 'mariadb', 'oracle'].indexOf(form.protocol) !== -1) {
              this.fieldsMeta.username.rules = [Required]
              this.fieldsMeta.username.rules[0].required = true
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
            return form.protocol === 'k8s'
          }
        },
        protocol: {
          rules: [Required],
          el: {
            style: 'width:100%'
          },
          disabled: true
        },
        ad_domain: {
          label: this.$t('assets.AdDomain'),
          hidden: (form) => ['rdp'].indexOf(form.protocol) === -1,
          helpText: this.$t('assets.AdDomainHelpText')
        },
        cmd_filters: {
          component: Select2,
          el: {
            multiple: true,
            value: [],
            ajax: {
              url: '/api/v1/assets/cmd-filters/'
            }
          }
        },
        priority: {
          rules: [Required],
          helpText: this.$t('assets.PriorityHelpMessage')
        },
        auto_push: {
          type: 'switch',
          el: {
            disabled: false
          },
          hidden: form => {
            return form.login_mode === 'manual'
          },
          on: {
            input: ([value], updateForm) => {
              if (!value) {
                updateForm({ auto_generate_key: value })
              }
            }
          }
        },
        sftp_root: {
          rules: [Required],
          helpText: this.$t('assets.SFTPHelpMessage'),
          hidden: (item) => item.protocol !== 'ssh'
        },
        sudo: {
          rules: [Required],
          helpText: this.$t('assets.SudoHelpMessage'),
          hidden: (item) => item.protocol !== 'ssh' || !item.auto_push
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
        },
        auto_generate_key: {
          type: 'switch',
          label: this.$t('assets.AutoGenerateKey'),
          hidden: form => {
            this.fieldsMeta.auto_generate_key.el.disabled = ['ssh', 'rdp'].indexOf(form.protocol) === -1 || form.login_mode === 'manual'
            if (JSON.stringify(this.$route.params) !== '{}') {
              return true
            }
            if (form.protocol === 'k8s') {
              return true
            }
          },
          el: {
            disabled: false
          }
        },
        shell: {
          hidden: (item) => item.protocol !== 'ssh' || !item.auto_push,
          rules: [Required]
        },
        home: {
          label: this.$t('assets.Home'),
          hidden: (item) => item.protocol !== 'ssh' || !item.auto_push || item.username_same_with_user,
          helpText: this.$t('assets.HomeHelpMessage')
        },
        system_groups: {
          label: this.$t('assets.LinuxUserAffiliateGroup'),
          hidden: (item) => ['ssh', 'rdp'].indexOf(item.protocol) === -1 || !item.auto_push || item.username_same_with_user,
          helpText: this.$t('assets.GroupsHelpMessage')
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
    const method = params.id ? 'post' : 'put'
    if (method === 'post') {
      this.fieldsMeta.token.rules[0].required = false
    }
  }
}
</script>

<style lang='less' scoped>

</style>
