<template>
  <GenericCreateUpdatePage ref="createUpdatePage" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { CronTab, Select2 } from '@/components'
import rules from '@/components/Form/DataForm/rules'
import SyncInstanceTaskStrategy from './components/SyncInstanceTaskStrategy/index'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      initial: {
        is_periodic: false,
        interval: 24,
        hostname_strategy: 'instance_name_partial_ip',
        ip_network_segment_group: ['*']
      },
      fields: [
        [this.$t('Basic'), ['name']],
        [this.$t('CloudSource'), ['account', 'regions']],
        [this.$t('SaveSetting'), [
          'hostname_strategy', 'ip_network_segment_group',
          'sync_ip_type', 'is_always_update', 'fully_synchronous'
        ]],
        [this.$t('SyncStrategy'), ['strategy']],
        [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']],
        [this.$t('Other'), ['comment']]
      ],
      url: '/api/v1/xpack/cloud/sync-instance-tasks/',
      fieldsMeta: {
        account: {
          label: this.$t('Account'),
          on: {
            change: ([event], updateForm) => {
              vm.fieldsMeta.regions.el.ajax.url = `/api/v1/xpack/cloud/regions/?account_id=${event?.pk}`
              updateForm({ regions: '' })
            }
          },
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/xpack/cloud/accounts/',
              transformOption: (item) => {
                const label = `${item.name}(${item.provider.label})`
                return { label: label, value: item.id }
              }
            }
          }
        },
        hostname_strategy: {
          rules: [rules.RequiredChange],
          helpTip: this.$t('HostnameStrategy')
        },
        is_always_update: {
          type: 'switch',
          label: this.$t('IsAlwaysUpdate'),
          helpTip: this.$t('IsAlwaysUpdateHelpTip')
        },
        fully_synchronous: {
          type: 'switch',
          label: this.$t('FullySynchronous'),
          helpTip: this.$t('FullySynchronousHelpTip')
        },
        regions: {
          component: Select2,
          el: {
            multiple: true,
            allowCreate: true,
            value: [],
            ajax: {
              url: '/api/v1/xpack/cloud/regions/',
              processResults(data) {
                const results = data.regions?.map((item) => {
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
          component: CronTab,
          hidden: (formValue) => {
            return formValue.is_periodic === false
          },
          helpTip: this.$t('CrontabOfCreateUpdatePage')
        },
        interval: {
          hidden: (formValue) => {
            return formValue.is_periodic === false
          },
          helpText: this.$t('IntervalOfCreateUpdatePage')
        },
        strategy: {
          label: this.$t('Strategy'),
          component: SyncInstanceTaskStrategy,
          helpTip: this.$t('StrategyHelpTip')
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter' },
      createSuccessNextRoute: { name: 'CloudCenter' },
      afterGetFormValue(formValue) {
        formValue.protocols = formValue.protocols?.split(' ').map(i => {
          const [name, port] = i.split('/')
          return { name, port }
        })
        return formValue
      },
      cleanFormValue(value) {
        const ipNetworkSegments = value.ip_network_segment_group
        const strategy = value?.strategy || []
        if (!Array.isArray(ipNetworkSegments)) {
          value.ip_network_segment_group = ipNetworkSegments ? ipNetworkSegments.split(',') : []
        }
        value.strategy = strategy.map(item => { return item.id })
        return value
      },
      onPerformError(error, method, vm) {
        this.$emit('submitError', error)
        const response = error.response
        const data = response.data
        if (response.status === 400) {
          for (const key of Object.keys(data)) {
            let value = data[key]
            if (key === 'protocols') {
              value = Object.values(data[key])
            }
            if (value instanceof Array) {
              value = value.join(';')
            }
            this.$refs.form.setFieldError(key, value)
          }
        }
      }
    }
  },
  async mounted() {
    const params = this.$route.params
    // 更新获取链接
    if (params.id) {
      const form = await this.$refs.createUpdatePage.$refs.createUpdateForm.getFormValue()
      this.fieldsMeta.regions.el.ajax.url = form.account?.id ? `/api/v1/xpack/cloud/regions/?account_id=${form.account.id}` : `/api/v1/xpack/cloud/regions/`
    }
  },
  methods: {
  }
}

</script>

<style lang="less" scoped>
</style>
