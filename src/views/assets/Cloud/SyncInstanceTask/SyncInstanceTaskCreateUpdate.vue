<template>
  <GenericCreateUpdatePage ref="createUpdatePage" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { Select2, CronTab } from '@/components'
import rules from '@/components/DataForm/rules'
import Protocols from '@/views/assets/Asset/components/Protocols/index'

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
        ip_network_segment_group: '*'
      },
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('xpack.Cloud.CloudSource'), ['account', 'regions']],
        [this.$t('xpack.Cloud.SaveSetting'), ['hostname_strategy', 'node', 'unix_admin_user', 'windows_admin_user', 'protocols', 'ip_network_segment_group', 'is_always_update']],
        [this.$t('xpack.Timer'), ['is_periodic', 'crontab', 'interval']],
        [this.$t('common.Other'), ['comment']]
      ],
      url: '/api/v1/xpack/cloud/sync-instance-tasks/',
      fieldsMeta: {
        account: {
          on: {
            change: ([event], updateForm) => {
              vm.fieldsMeta.regions.el.ajax.url = `/api/v1/xpack/cloud/regions/?account_id=${event}`
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
        node: {
          rules: [rules.RequiredChange],
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
        unix_admin_user: {
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/assets/admin-users/'
            }
          }
        },
        windows_admin_user: {
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/assets/admin-users/'
            }
          }
        },
        protocols: {
          component: Protocols
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
        }
      },
      updateSuccessNextRoute: { name: 'CloudCenter' },
      createSuccessNextRoute: { name: 'CloudCenter' },
      afterGetFormValue(formValue) {
        formValue.ip_network_segment_group = formValue.ip_network_segment_group.toString()
        return formValue
      },
      cleanFormValue(value) {
        if (!Array.isArray(value.ip_network_segment_group)) {
          value.ip_network_segment_group = value.ip_network_segment_group ? value.ip_network_segment_group.split(',') : []
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
      this.fieldsMeta.regions.el.ajax.url = form.account ? `/api/v1/xpack/cloud/regions/?account_id=${form.account}` : `/api/v1/xpack/cloud/regions/`
    }
  },
  methods: {
  }
}

</script>

<style lang="less" scoped>
</style>
