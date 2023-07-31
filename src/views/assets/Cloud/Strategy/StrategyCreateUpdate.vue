<template>
  <GenericCreateUpdatePage
    v-bind="$data"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { RequiredChange, specialEmojiCheck } from '@/components/DataForm/rules'
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
        [this.$t('common.Basic'), ['name']],
        [this.$t('common.Strategy'), ['task_rules', 'task_actions']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        name: {
          rules: [RequiredChange, specialEmojiCheck]
        },
        task_rules: {
          component: RuleInput
        },
        task_actions: {
          component: ActionInput
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter', params: { activeMenu: 'StrategyList' }},
      createSuccessNextRoute: { name: 'CloudCenter', params: { activeMenu: 'StrategyList' }},
      getUrl() {
        const id = this.$route.params?.id
        return id ? `${this.url}${id}/` : this.url
      },
      cleanFormValue(values) {
        return values
      },
      afterGetFormValue(formValue) {
        return formValue
      }
    }
  },
  methods: {}
}

</script>

<style lang="less" scoped>
</style>
