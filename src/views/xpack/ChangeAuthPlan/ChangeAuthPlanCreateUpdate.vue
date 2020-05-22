<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { AssetSelect } from '@/components'

export default {
  name: 'ChangeAuthPlanCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/xpack/change-auth-plan/plan/',
      fields: [
        [this.$t('xpack.Basic'), ['name']],
        [this.$t('xpack.Asset'), ['username', 'assets', 'nodes']],
        [this.$t('xpack.PasswordStrategy'), ['password_strategy', 'password', 'password_rules_length']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('xpack.Other'), ['comment']]
      ],
      initial: {
        password_strategy: 'custom',
        password_rules_length: 20,
        is_periodic: true,
        interval: 24
      },
      fieldsMeta: {
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          rules: [
            { required: false }
          ],
          label: this.$t('xpack.Asset')
        },
        password: {
          hidden: (formValue) => {
            return formValue.password_strategy !== 'custom'
          }
        },
        password_rules_length: {
          type: 'input',
          label: this.$t('xpack.PasswordLength'),
          hidden: (formValue) => {
            return ['random_one', 'random_all'].indexOf(formValue.password_strategy) === -1
          }
        },
        nodes: {
          label: this.$t('xpack.Node'),
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              processResults(data) {
                let results = data.results
                results = results.map((item) => {
                  return { label: item.full_value, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
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
          }
        },
        interval: {
          label: this.$t('xpack.CyclePerform'),
          hidden: (formValue) => {
            return formValue.is_periodic === false
          }
        }
      },
      cleanFormValue(values) {
        if (['random_one', 'random_all'].indexOf(values.password_strategy) !== -1) {
          const password_rules = {}
          const password_rules_prefix = 'password_rules_'
          for (const key of Object.keys(values)) {
            if (key.startsWith(password_rules_prefix)) {
              password_rules[key.slice(password_rules_prefix.length)] = values[key]
              delete values[key]
            }
          }
          values['password_rules'] = password_rules
        }
        return values
      }
    }
  }
}
</script>

<style scoped>

</style>
