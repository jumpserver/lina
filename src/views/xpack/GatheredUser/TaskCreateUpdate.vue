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
        interval: null
      },
      fieldsMeta: {
        crontab: {
          helpTips: this.$t('common.CrontabHelpTips')
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
      }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
