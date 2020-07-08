<template>
  <GenericCreateUpdatePage v-bind="$data" :perform-submit="performSubmit" :create-success-next-route="createSuccessNextRoute" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getDaysFuture } from '@/utils/common'
export default {
  components: {
    GenericCreateUpdatePage
  },

  data() {
    const now = new Date()
    const date_expired = getDaysFuture(7, now).toISOString()
    const date_start = now.toISOString()
    return {
      initial: {
        ips_or_not: true,
        date_expired: date_expired,
        date_start: date_start
      },
      fields: [
        [this.$t('common.Basic'), ['title', 'ips_or_not', 'ips', 'hostname', 'date_start', 'date_expired', 'assignees']]
      ],
      fieldsMeta: {
        ips_or_not: {
          label: 'IP组或主机名',
          type: 'checkbox'
        },
        ips: {
          hidden: (formValue) => {
            return !formValue.ips_or_not
          },
          rules: [
            { required: true }
          ],
          helpText: '请输入逗号分割的IP地址组'
        },
        host_name: {
          hidden: (formValue) => {
            return formValue.ips_or_not
          },
          rules: [
            { required: true }
          ],
          helpText: '支持模糊匹配'
        },
        assignees: {
          el: {
            multiple: true,
            ajax: {
              url: '/api/v1/users/users/',
              processResults: function(data) {
                console.log(data)
              }
            },
            value: []
          }
        }
      },
      url: '/api/v1/tickets/tickets/request-asset-perm/',
      createSuccessNextRoute: {
        name: 'TicketList'
      }
    }
  },
  methods: {
    performSubmit(validValues) {
      const ips = validValues.ips
      validValues.ips = ips.split(',')
      return this.$axios['post'](this.url, validValues)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
