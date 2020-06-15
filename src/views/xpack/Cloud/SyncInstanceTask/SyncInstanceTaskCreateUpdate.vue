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
      initial: {
        is_periodic: true,
        interval: 24
      },
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Cloud.CloudSource'), ['account', 'regions']],
        [this.$t('xpack.Cloud.SaveSetting'), ['node', 'admin_user', 'covered_always']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['comment']]
      ],
      url: '/api/v1/xpack/cloud/sync-instance-tasks/',
      fieldsMeta: {
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
        },
        is_periodic: {
          type: 'switch'
        },
        crontab: {
          label: this.$t('xpack.RegularlyPerform'),
          hidden: (formValue) => {
            return formValue.is_periodic === false
          },
          helpText: this.$t('xpack.HelpText.CrontabOfCreateUpdatePage')
        },
        interval: {
          label: this.$t('xpack.CyclePerform'),
          hidden: (formValue) => {
            return formValue.is_periodic === false
          },
          helpText: this.$t('xpack.HelpText.IntervalOfCreateUpdatePage')
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter' },
      createSuccessNextRoute: { name: 'CloudCenter' }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
