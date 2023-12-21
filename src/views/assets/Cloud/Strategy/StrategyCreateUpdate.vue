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
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('common.RuleSetting'), ['rule_relation', 'strategy_rules']],
        [this.$t('common.ActionSetting'), ['strategy_actions']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        name: {
          rules: [RequiredChange, specialEmojiCheck]
        },
        rule_relation: {
          label: this.$t('common.RuleRelation'),
          helpTips: this.$t('common.RuleRelationHelpTips')
        },
        strategy_rules: {
          component: RuleInput
        },
        strategy_actions: {
          component: ActionInput
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter', params: { activeMenu: 'StrategyList' }},
      createSuccessNextRoute: { name: 'CloudCenter', params: { activeMenu: 'StrategyList' }},
      getUrl() {
        const id = this.$route.params?.id
        return id ? `${this.url}${id}/` : this.url
      }
    }
  },
  methods: {}
}

</script>

<style lang="scss" scoped>
>>> .attr-input {
  margin-top: -6px;
}
</style>
