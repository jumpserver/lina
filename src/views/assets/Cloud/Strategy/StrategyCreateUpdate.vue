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
          component: RuleInput
        },
        strategy_actions: {
          component: ActionInput
        }
      },
      updateSuccessNextRoute: this.getNextRoute(),
      createSuccessNextRoute: this.getNextRoute(),
      getUrl() {
        const id = this.$route.params?.id
        return id ? `${this.url}${id}/` : this.url
      }
    }
  },
  methods: {
    getNextRoute() {
      return {
        name: 'CloudAccountList', params: { activeMenu: 'StrategyList' },
        query: { category: this.$route.query.category || 'host' }
      }
    }
  }
}

</script>

<style lang="scss" scoped>
</style>
