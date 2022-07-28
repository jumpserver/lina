<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    v-bind="$attrs"
    @getObjectDone="onGetObjectDone($event)"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { Required } from '@/components/DataForm/rules'

export default {
  name: 'CommonUserSSH',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        login_mode: 'auto',
        username_same_with_user: false
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'protocol']],
        [this.$t('assets.Account'), [
          'login_mode', 'username', 'username_same_with_user',
          'su_enabled', 'su_from'
        ]],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        login_mode: {
          on: {
            input: ([value], updateForm) => {
              if (value === 'manual') {
                updateForm({ auto_push_account: false })
                updateForm({ auto_generate_key: false })
              }
            }
          },
          helpText: '使用资产上已添加的账号登录，或者手动输入密码登录'
        },
        username: {
          el: {
            disabled: false
          },
          rules: [Object.assign({}, Required)],
          hidden: (form) => {
            if (['vnc', 'redis', 'telnet'].includes(form.protocol)) {
              this.fieldsMeta.username.rules[0].required = false
            } else if (form.login_mode === 'manual') {
              this.fieldsMeta.username.rules[0].required = false
            } else if (form.username_same_with_user) {
              this.fieldsMeta.username.rules[0].required = false
            } else {
              this.fieldsMeta.username.rules[0].required = true
            }

            if (form.username_same_with_user) {
              this.fieldsMeta.username.el.disabled = true
              form.username = ''
            } else {
              this.fieldsMeta.username.el.disabled = false
            }
          }
        },
        username_same_with_user: {
          type: 'switch',
          label: this.$t('assets.DynamicUsername'),
          helpText: this.$t('assets.UsernameHelpMessage'),
          el: {
            disabled: false
          }
        },
        protocol: {
          rules: [Required],
          el: {
            style: 'width:100%',
            disabled: true
          }
        },
        su_enabled: {
          type: 'switch'
        },
        su_from: {
          hidden: (item) => !item.su_enabled,
          rules: [Required],
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: '/api/v1/assets/system-users/su-from/',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        }
      },
      url: '/api/v1/assets/system-users/'
    }
  },
  methods: {
    onGetObjectDone(obj) {
      this.fieldsMeta.private_key.el.fingerprint = obj.ssh_key_fingerprint
    }
  }
}
</script>

<style lang='less' scoped>

</style>
