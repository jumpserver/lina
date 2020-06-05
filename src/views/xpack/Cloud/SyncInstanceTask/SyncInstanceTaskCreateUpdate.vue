<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Select2 } from '@/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      fields: [
        [
          this.$t(''), [
            'name', 'account', 'regions', 'node', 'admin_user', 'covered_always',
            'is_periodic', 'crontab', 'interval', 'comment'
          ]
        ]
      ],
      url: '/api/v1/xpack/cloud/sync-instance-tasks/',
      fieldsMeta: {
        crontab: {
          helpTips: this.$t('common.CrontabHelpTips')
        },
        account: {
          on: {
            change: ([event], updateForm) => {
              vm.fieldsMeta.regions.el.ajax.url = `/api/v1/xpack/cloud/regions/?account_id=${event}`
            }
          },
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/xpack/cloud/accounts/'
            }
          }
        },
        node: {
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              transformOption: (item) => {
                return { label: item.full_value, value: item.id }
              }
            }
          }
        },
        admin_user: {
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/assets/admin-users/'
            }
          }
        },
        covered_always: {
          type: 'switch',
          helpTips: this.$t('xpack.Cloud.CoveredAlwaysHelpTips')
        },
        is_periodic: {
          type: 'switch'
        },
        regions: {
          component: Select2,
          el: {
            multiple: true,
            value: [],
            ajax: {
              url: '/api/v1/xpack/cloud/regions/',
              processResults(data) {
                const results = data.regions.map((item) => {
                  return { label: item.name, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
          }
        }
      }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
