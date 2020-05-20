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
      fieldsMeta: {
        nodes: {
          el: {
            multiple: true,
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              processResults(data) {
                const results = data.results.map((item) => {
                  return { label: item.name, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
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
