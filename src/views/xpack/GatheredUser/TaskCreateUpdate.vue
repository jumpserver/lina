<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [this.$t('common.Basic'), ['name', 'nodes']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Others'), ['comment']]
      ],
      url: '/api/v1/xpack/gathered-user/tasks/',
      initial: {
        is_periodic: true,
        interval: 24
      },
      fieldsMeta: {
        crontab: {
          hidden: (formValue) => {
            return !formValue.is_periodic
          },
          helpText: this.$t('xpack.ChangeAuthPlan.HelpText.CrontabOfCreateUpdatePage')
        },
        interval: {
          label: this.$t('xpack.ChangeAuthPlan.CyclePerform'),
          helpText: this.$t('xpack.ChangeAuthPlan.HelpText.IntervalOfCreateUpdatePage'),
          hidden: (formValue) => {
            return !formValue.is_periodic
          }
        },
        nodes: {
          el: {
            multiple: true,
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/'
            }
          }
        },
        'is_periodic': {
          type: 'switch'
        }
      },
      createSuccessNextRoute: { name: 'GatherUserListIndex' },
      updateSuccessNextRoute: { name: 'GatherUserListIndex' }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
