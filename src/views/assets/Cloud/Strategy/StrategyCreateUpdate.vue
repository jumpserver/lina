<template>
  <GenericCreateUpdateDrawer :resource="$tc('xpack.Cloud.SyncStrategy')" v-bind="$data" />
</template>

<script>
import { RequiredChange, specialEmojiCheck } from '@/components/Form/DataForm/rules'
import RuleInput from './components/RuleInput'
import ActionInput from './components/ActionInput'
import GenericCreateUpdateDrawer from '@/layout/components/GenericCreateUpdateDrawer/index.vue'

export default {
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    return {
      url: '/api/v1/xpack/cloud/strategies/',
      fields: [
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('common.Strategy'), ['strategy_rules', 'strategy_actions']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        name: {
          rules: [RequiredChange, specialEmojiCheck]
        },
        strategy_rules: {
          component: RuleInput
        },
        strategy_actions: {
          component: ActionInput
        }
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
