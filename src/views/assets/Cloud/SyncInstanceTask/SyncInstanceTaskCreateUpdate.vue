<template>
  <GenericCreateUpdatePage ref="createUpdatePage" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { CronTab, Select2 } from '@/components'
import rules from '@/components/DataForm/rules'
import SyncInstanceTaskStrategy from './components/SyncInstanceTaskStrategy/indexa'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      initial: {
        is_periodic: true,
        interval: 24,
        hostname_strategy: 'instance_name_partial_ip',
        ip_network_segment_group: ['*']
      },
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Cloud.CloudSource'), ['account', 'regions']],
        [this.$t('xpack.Cloud.SaveSetting'), ['hostname_strategy', 'ip_network_segment_group', 'sync_ip_type', 'is_always_update']],
        [this.$t('同步策略'), ['strategy']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['comment']]
      ],
      url: '/api/v1/xpack/cloud/sync-instance-tasks/',
      fieldsMeta: {
        account: {
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
              url: '/api/v1/xpack/cloud/accounts/'
            }
          }
        },
        hostname_strategy: {
          rules: [rules.RequiredChange],
          helpText: this.$t('xpack.Cloud.HostnameStrategy')
        },
        is_always_update: {
          type: 'switch',
          label: this.$t('xpack.Cloud.IsAlwaysUpdate'),
          helpTips: this.$t('xpack.Cloud.IsAlwaysUpdateHelpTips')
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
          component: CronTab,
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
        },
        strategy: {
          label: '条件动作配置',
          component: SyncInstanceTaskStrategy
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
        if (!Array.isArray(ipNetworkSegments)) {
          value.ip_network_segment_group = ipNetworkSegments ? ipNetworkSegments.split(',') : []
        }
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
