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
        crontab: {
          helpTips: `eg: Every Sunday 03:05 run <5 3 * * 0> <br>
                    Tips:
                    Using 5 digits linux crontab expressions
                    <min hour day month week>
                    (<a href='https://tool.lu/crontab/' target='_blank'>Online tools</a>) <br>
                    Note:
                    If both Regularly perform and Cycle perform are set,
                    give priority to Regularly perform`
        },
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
