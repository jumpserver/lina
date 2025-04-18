import { UpdateToken, UploadSecret } from '@/components/Form/FormFields'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import { Required, RequiredChange } from '@/components/Form/DataForm/rules'
import AutomationParamsForm from '@/views/assets/Platform/AutomationParamsSetting.vue'

export const accountFieldsMeta = (vm) => {
  const defaultPrivilegedAccounts = ['root', 'administrator']

  function onPrivilegedUser(value, updateForm) {
    const maybePrivileged = defaultPrivilegedAccounts.includes(value)
    if (maybePrivileged) {
      updateForm({ privileged: true, secret_reset: false, push_now: false })
    }
  }

  return {
    assets: {
      component: Select2,
      label: vm.$t('Asset'),
      rules: [Required],
      el: {
        multiple: true,
        ajax: {
          url: '/api/v1/assets/assets/',
          transformOption: (item) => {
            return { label: item.name + '(' + item.address + ')', value: item.id }
          }
        }
      },
      hidden: () => {
        return vm.platform || vm.asset
      }
    },
    template: {
      component: Select2,
      rules: [Required],
      el: {
        get disabled() {
          return vm.isDisabled
        },
        multiple: false,
        ajax: {
          url: '/api/v1/accounts/account-templates/',
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        }
      },
      hidden: () => {
        return vm.platform || vm.asset || !vm.addTemplate
      }
    },
    on_invalid: {
      rules: [Required],
      label: vm.$t('AccountPolicy'),
      helpTip: vm.$t('AccountPolicyHelpText'),
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: () => {
        return vm.platform || vm.asset
      }
    },
    name: {
      label: vm.$t('Name'),
      rules: [RequiredChange],
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      on: {
        input: ([value], updateForm) => {
          if (!vm.usernameChanged) {
            if (!vm.account?.name) {
              updateForm({ username: value })
            }
          }
          onPrivilegedUser(value, updateForm)
        }
      },
      hidden: () => {
        return vm.addTemplate
      }
    },
    username: {
      el: {
        get disabled() {
          return !!vm.account?.name || vm.isDisabled
        }
      },
      on: {
        input: ([value], updateForm) => {
          vm.usernameChanged = true
        },
        change: ([value], updateForm) => {
          onPrivilegedUser(value, updateForm)
        }
      },
      hidden: () => {
        return vm.addTemplate
      }
    },
    privileged: {
      label: vm.$t('Privileged'),
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: () => {
        return vm.addTemplate
      }
    },
    su_from: {
      component: Select2,
      hidden: (formValue) => {
        return !vm.asset?.id || !vm.iPlatform.su_enabled
      },
      el: {
        multiple: false,
        clearable: true,
        ajax: {
          url: `/api/v1/accounts/accounts/su-from-accounts/?account=${vm.account?.id || ''}&asset=${vm.asset?.id || ''}`,
          transformOption: (item) => {
            return { label: `${item.name}(${item.username})`, value: item.id }
          }
        }
      }
    },
    su_from_username: {
      label: vm.$t('UserSwitchFrom'),
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: (formValue) => {
        return vm.platform || vm.asset || vm.addTemplate
      }
    },
    password: {
      label: vm.$t('Password'),
      component: UpdateToken,
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: (formValue) => {
        return formValue.secret_type !== 'password' || vm.addTemplate
      }
    },
    ssh_key: {
      label: vm.$t('PrivateKey'),
      component: UploadSecret,
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: (formValue) => formValue.secret_type !== 'ssh_key' || vm.addTemplate
    },
    passphrase: {
      label: vm.$t('Passphrase'),
      component: UpdateToken,
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: (formValue) => formValue.secret_type !== 'ssh_key' || vm.addTemplate
    },
    token: {
      label: vm.$t('Token'),
      component: UploadSecret,
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: (formValue) => formValue.secret_type !== 'token' || vm.addTemplate
    },
    access_key: {
      id: 'access_key',
      label: vm.$t('AccessKey'),
      component: UploadSecret,
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: (formValue) => formValue.secret_type !== 'access_key' || vm.addTemplate
    },
    api_key: {
      id: 'api_key',
      label: vm.$t('ApiKey'),
      component: UploadSecret,
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: (formValue) => formValue.secret_type !== 'api_key' || vm.addTemplate
    },
    secret_type: {
      type: 'radio-group',
      options: [],
      el: {
        get disabled() {
          return vm.isDisabled
        }
      },
      hidden: () => {
        return vm.addTemplate
      }
    },
    push_now: {
      helpTip: vm.$t('WindowsPushHelpText'),
      hidden: (formValue) => {
        const automation = vm.iPlatform.automation || {}
        return !automation.push_account_enabled ||
          !automation.ansible_enabled ||
          !vm.$hasPerm('accounts.push_account') ||
          (formValue.secret_type === 'ssh_key' && vm.iPlatform.type.value === 'windows') ||
          vm.addTemplate ||
          !formValue.secret_reset
      }
    },
    params: {
      label: vm.$t('PushParams'),
      component: AutomationParamsForm,
      el: {},
      hidden: (formValue) => {
        const automation = vm.iPlatform.automation || {}
        if (!vm.iPlatform.automation) {
          return true
        }
        vm.fieldsMeta.params.el.method = vm.iPlatform.automation.push_account_method
        vm.fieldsMeta.params.el.pushAccountParams = vm.iPlatform.automation.push_account_params
        return !formValue.push_now ||
          !automation.push_account_enabled ||
          !automation.ansible_enabled ||
          (formValue.secret_type === 'ssh_key' &&
            vm.iPlatform.type.value === 'windows') ||
          !vm.$hasPerm('accounts.push_account') ||
          vm.addTemplate
      }
    },
    is_active: {
      label: vm.$t('IsActive'),
      el: {
        get disabled() {
          return vm.isDisabled
        }
      }
    },
    comment: {
      label: vm.$t('Comment'),
      el: {
        get disabled() {
          return vm.isDisabled
        }
      }
    },
    secret_reset: {
      label: vm.$t('SecretReset'),
      el: {
        get disabled() {
          return vm.isDisabled
        }
      }
    }
  }
}
