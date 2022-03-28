import { Required } from '@/components/DataForm/rules'
import { Select2, UploadKey } from '@/components'
import { UpdateToken } from '@/components/FormFields'

function getFields() {
  const login_mode = {
    on: {
      input: ([value], updateForm) => {
        if (value === 'manual') {
          updateForm({ auto_push: false })
          updateForm({ auto_generate_key: false })
        }
      }
    }
  }

  const username = {
    el: {
      disabled: false
    },
    on: {
      input: ([value], updateForm) => {
        updateForm({ home: `/home/${value}` })
      }
    },
    rules: [Object.assign({}, Required)],
    hidden: (form) => {
      if (['vnc'].includes(form.protocol)) {
        this.fieldsMeta.username.rules[0].required = false
      } else if (form.login_mode === 'manual') {
        this.fieldsMeta.username.rules[0].required = false
      } else if (form.username_same_with_user) {
        this.fieldsMeta.username.rules[0].required = false
      } else if (form.protocol === 'redis') {
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
  }

  const private_key = {
    component: UploadKey,
    hidden: (form) => {
      if (form.login_mode !== 'auto') {
        return true
      }
      return form.auto_generate_key === true
    }
  }

  const username_same_with_user = {
    type: 'switch',
    label: this.$t('assets.DynamicUsername'),
    helpText: this.$t('assets.UsernameHelpMessage'),
    el: {
      disabled: false
    },
    hidden: form => {
      const params = this.$route.params
      const method = params.id ? 'update' : 'create'
      if (method === 'update') {
        this.fieldsMeta.username_same_with_user.el.disabled = true
      }
    }
  }

  const auto_generate_key = {
    type: 'switch',
    label: this.$t('assets.AutoGenerateKey'),
    hidden: form => {
      if (JSON.stringify(this.$route.params) !== '{}') {
        return true
      }
      if (form.protocol === 'k8s') {
        return true
      }
      if (form.type === 'admin') {
        form.auto_generate_key = false
        return true
      }

      if (form.login_mode === 'manual') {
        this.fieldsMeta.auto_generate_key.el.disabled = true
      } else {
        this.fieldsMeta.auto_generate_key.el.disabled = false
      }
    },
    el: {
      disabled: false
    }
  }

  const protocol = {
    rules: [Required],
    el: {
      style: 'width:100%',
      disabled: true
    }
  }

  const cmd_filters = {
    label: this.$t('assets.CmdFilter'),
    component: Select2,
    el: {
      multiple: true,
      value: [],
      ajax: {
        url: '/api/v1/assets/cmd-filters/'
      }
    }
  }

  const auto_push = {
    type: 'switch',
    el: {
      disabled: false
    },
    hidden: form => {
      if (form.login_mode === 'manual' || form.type === 'admin' || (form.ad_domain && form.ad_domain !== '')) {
        this.fieldsMeta.auto_push.el.disabled = true
      } else {
        this.fieldsMeta.auto_push.el.disabled = false
      }
    },
    on: {
      input: ([value], updateForm) => {
        if (!value) {
          updateForm({ auto_generate_key: value })
        }
      }
    },
    helpText: this.$t('assets.SetAdDomainNoDisabled')
  }

  const update_password = {
    label: this.$t('users.UpdatePassword'),
    type: 'checkbox',
    hidden: (formValue) => {
      if (formValue.update_password) {
        return true
      }
      if (formValue.login_mode === 'manual') {
        return true
      }
      return !this.$route.params.id
    }
  }

  const password = {
    component: UpdateToken,
    hidden: form => {
      if (form.login_mode !== 'auto' || form.auto_generate_key) {
        return true
      }
      if (!this.$route.params.id) {
        return false
      }
    }
  }

  const passphrase = {
    component: UpdateToken,
    hidden: (form) => {
      if (form.login_mode !== 'auto') {
        return true
      }
      return form.auto_generate_key === true
    }
  }

  const system_groups = {
    label: this.$t('assets.LinuxUserAffiliateGroup'),
    hidden: (item) => !item.auto_push || item.username_same_with_user,
    helpText: this.$t('assets.GroupsHelpMessage')
  }

  const type = {
  }

  const su_enabled = {
    type: 'switch',
    hidden: (item) => item.protocol !== 'ssh'
  }

  const su_from = {
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

  return {
    login_mode: login_mode,
    username: username,
    private_key: private_key,
    username_same_with_user: username_same_with_user,
    auto_generate_key: auto_generate_key,
    protocol: protocol,
    cmd_filters: cmd_filters,
    auto_push: auto_push,
    update_password: update_password,
    password: password,
    passphrase: passphrase,
    system_groups: system_groups,
    type: type,
    su_enabled: su_enabled,
    su_from: su_from
  }
}

export default getFields
