import { UpdateToken, UploadSecret } from '@/components/Form/FormFields'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import AssetSelect from '@/components/Apps/AssetSelect/index.vue'
import { Required, RequiredChange } from '@/components/Form/DataForm/rules'
import AutomationParamsForm from '@/views/assets/Platform/AutomationParamsSetting.vue'

export const accountFieldsMeta = (vm) => {
  const defaultPrivilegedAccounts = ['root', 'administrator']
  return {
    assets: {
      rules: [Required],
      component: AssetSelect,
      label: vm.$t('assets.Asset'),
      el: {
        multiple: false
      },
      hidden: () => {
        return vm.platform || vm.asset
      }
    },
    template: {
      component: Select2,
      rules: [Required],
      el: {
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
      label: vm.$t('accounts.AccountPolicy'),
      helpText: vm.$t('accounts.BulkCreateStrategy'),
      hidden: () => {
        return vm.platform || vm.asset
      }
    },
    name: {
      label: vm.$t('common.Name'),
      rules: [RequiredChange],
      on: {
        input: ([value], updateForm) => {
          if (!vm.usernameChanged) {
            if (!vm.account?.name) {
              updateForm({ username: value })
            }
            const maybePrivileged = defaultPrivilegedAccounts.includes(value)
            if (maybePrivileged) {
              updateForm({ privileged: true })
            }
          }
        }
      },
      hidden: () => {
        return vm.addTemplate
      }
    },
    username: {
      el: {
        disabled: !!vm.account?.name
      },
      on: {
        input: ([value], updateForm) => {
          vm.usernameChanged = true
        },
        change: ([value], updateForm) => {
          const maybePrivileged = defaultPrivilegedAccounts.includes(value)
          if (maybePrivileged) {
            updateForm({ privileged: true })
          }
        }
      },
      hidden: () => {
        return vm.addTemplate
      }
    },
    privileged: {
      label: vm.$t('assets.Privileged'),
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
      label: vm.$t('assets.UserSwitchFrom'),
      hidden: (formValue) => {
        return vm.platform || vm.asset || vm.addTemplate
      }
    },
    password: {
      label: vm.$t('assets.Password'),
      component: UpdateToken,
      hidden: (formValue) => {
        return formValue.secret_type !== 'password' || vm.addTemplate
      }
    },
    ssh_key: {
      label: vm.$t('assets.PrivateKey'),
      component: UploadSecret,
      hidden: (formValue) => formValue.secret_type !== 'ssh_key' || vm.addTemplate
    },
    passphrase: {
      label: vm.$t('assets.Passphrase'),
      component: UpdateToken,
      hidden: (formValue) => formValue.secret_type !== 'ssh_key' || vm.addTemplate
    },
    token: {
      label: vm.$t('assets.Token'),
      component: UploadSecret,
      hidden: (formValue) => formValue.secret_type !== 'token' || vm.addTemplate
    },
    access_key: {
      id: 'access_key',
      label: vm.$t('assets.AccessKey'),
      component: UploadSecret,
      hidden: (formValue) => formValue.secret_type !== 'access_key' || vm.addTemplate
    },
    api_key: {
      id: 'api_key',
      label: vm.$t('assets.ApiKey'),
      component: UploadSecret,
      hidden: (formValue) => formValue.secret_type !== 'api_key' || vm.addTemplate
    },
    secret_type: {
      type: 'radio-group',
      options: [],
      hidden: () => {
        return vm.addTemplate
      }
    },
    push_now: {
      helpText: vm.$t('accounts.AccountPush.WindowsPushHelpText'),
      hidden: (formValue) => {
        const automation = vm.iPlatform.automation || {}
        return !automation.push_account_enabled ||
          !automation.ansible_enabled ||
          !vm.$hasPerm('accounts.push_account') ||
          (formValue.secret_type === 'ssh_key' && vm.iPlatform.type.value === 'windows') ||
          vm.addTemplate
      }
    },
    params: {
      label: vm.$t('assets.PushParams'),
      component: AutomationParamsForm,
      el: {},
      hidden: (formValue) => {
        const automation = vm.iPlatform.automation || {}
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
      label: vm.$t('common.IsActive')
    },
    comment: {
      label: vm.$t('common.Comment'),
      hidden: () => {
        return vm.addTemplate
      }
    }
  }
}
