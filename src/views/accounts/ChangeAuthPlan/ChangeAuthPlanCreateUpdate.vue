<template>
  <GenericCreateUpdatePage v-bind="$data" :clean-form-value="cleanFormValue" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { AssetSelect } from '@/components'
import { Required } from '@/components/DataForm/rules'
import { UploadKey } from '@/components'
export default {
  name: 'ChangeAuthPlanCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    var validatorInterval = (rule, value, callback) => {
      if (parseInt(value) < 1) {
        return callback(new Error(this.$t('xpack.ChangeAuthPlan.validatorMessage.EnsureThisValueIsGreaterThanOrEqualTo1')))
      }
      callback()
    }
    return {
      url: '/api/v1/xpack/change-auth-plan/plan/',
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Asset'), ['username', 'assets', 'nodes']],
        [this.$t('xpack.ChangeAuthPlan.PasswordStrategy'), ['is_password', 'password_strategy', 'password', 'password_rules', 'is_ssh_key', 'ssh_key_strategy', 'private_key', 'ssh_key_rules']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['comment']]
      ],
      initial: {
        password_strategy: 'custom',
        is_periodic: true,
        password_rules: {
          length: 30
        },
        interval: 24,
        is_password: true,
        is_ssh_key: false,
        ssh_key_strategy: 'custom'
      },
      fieldsMeta: {
        is_password: {
          type: 'switch'
        },
        is_ssh_key: {
          type: 'switch'
        },
        // 密钥策略
        ssh_key_strategy: {
          hidden: (formValue) => {
            return formValue.is_ssh_key === false
          }
        },
        private_key: {
          hidden: (formValue) => {
            return formValue.ssh_key_strategy !== 'custom' || formValue.is_ssh_key === false
          },
          component: UploadKey
        },
        ssh_key_rules: {
          hidden: (formValue) => {
            return formValue.is_ssh_key === false
          }
        },
        username: {
          helpText: this.$t('xpack.ChangeAuthPlan.HelpText.UsernameOfCreateUpdatePage')
        },
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          rules: [
            { required: false }
          ],
          label: this.$t('xpack.Asset')
        },
        // 密码策略
        password_strategy: {
          hidden: (formValue) => {
            return formValue.is_password === false
          }
        },
        password: {
          hidden: (formValue) => {
            return formValue.password_strategy !== 'custom' || formValue.is_password === false
          },
          rules: [
            { required: this.$route.meta.action === 'create', message: this.$t('common.fieldRequiredError'), trigger: 'blur' }
          ]
        },
        password_rules: {
          type: 'group',
          items: this.generatePasswordRulesItemsFields()
        },
        nodes: {
          label: this.$t('xpack.Node'),
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              transformOption: (item) => {
                return { label: item.full_value, value: item.id }
              }
            }
          }
        },
        is_periodic: {
          type: 'switch'
        },
        crontab: {
          label: this.$t('xpack.RegularlyPerform'),
          hidden: (formValue) => {
            return formValue.is_periodic === false
          },
          helpText: this.$t('xpack.HelpText.CrontabOfCreateUpdatePage')
        },
        interval: {
          label: this.$t('xpack.CyclePerform'),
          hidden: (formValue) => {
            return formValue.is_periodic === false
          },
          helpText: this.$t('xpack.HelpText.IntervalOfCreateUpdatePage'),
          rules: [
            { validator: validatorInterval }
          ]
        }
      }
    }
  },
  methods: {
    cleanFormValue(data) {
      if (data['password_strategy'] === 'custom') {
        delete data['password_rules']
      } else {
        delete data['password']
      }
      if (data['interval'] === '') {
        delete data['interval']
      }
      return data
    },
    generatePasswordRulesItemsFields() {
      const itemsFields = []
      const items = [
        { id: 'length', prop: 'length', label: this.$t('xpack.ChangeAuthPlan.PasswordLength') }
      ]
      items.forEach((item, index, array) => {
        itemsFields.push({
          id: item.id, prop: item.prop, el: {}, attrs: {}, type: 'input', label: item.label, rules: [Required],
          hidden: (formValue) => { return ['random_one', 'random_all'].indexOf(formValue.password_strategy) === -1 || formValue.is_password === false }
        })
      })
      return itemsFields
    }
  }
}
</script>

<style scoped>

</style>

