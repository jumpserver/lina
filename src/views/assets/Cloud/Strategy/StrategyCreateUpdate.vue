<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { RequiredChange, specialEmojiCheck } from '@/components/Form/DataForm/rules'
import RuleInput from './components/RuleInput'
import ActionInput from './components/ActionInput'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/xpack/cloud/strategies/',
      fields: [
        [this.$t('Basic'), ['name', 'priority']],
        [this.$t('RuleSetting'), ['rule_relation', 'strategy_rules']],
        [this.$t('ActionSetting'), ['strategy_actions']],
        [this.$t('Other'), ['comment']]
      ],
      fieldsMeta: {
        name: {
          rules: [RequiredChange, specialEmojiCheck]
        },
        rule_relation: {
          label: this.$t('RuleRelation'),
          helpTip: this.$t('RuleRelationHelpTip')
        },
        strategy_rules: {
          label: this.$t('Rule'),
          component: RuleInput
        },
        strategy_actions: {
          label: this.$t('Action'),
          component: ActionInput
        }
      },
      updateSuccessNextRoute: { name: 'CloudAccountList', params: { activeMenu: 'StrategyList' } },
      createSuccessNextRoute: { name: 'CloudAccountList', params: { activeMenu: 'StrategyList' } },
      cleanFormValue: (value) => {
        value['category'] = this.$context.get('category') ?? 'host'
        return value
      },
      getUrl() {
        const id = this.$context.get('id')
        return id ? `${this.url}${id}/` : this.url
      }
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped></style>
