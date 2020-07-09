<template>
  <GenericCreateUpdatePage v-bind="$data" :perform-submit="performSubmit" :create-success-next-route="createSuccessNextRoute" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getDaysFuture } from '@/utils/common'
import GroupSelectFormatter from './Detail/GroupSelectFormatter'
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
        [this.$t('common.Basic'), ['title', 'ips', 'hostname', 'date_start', 'date_expired', 'assignees']]
      ],
      fieldsMeta: {
        ips: {
          helpText: '请输入逗号分割的IP地址组'
        },
        hostname: {
          helpText: '支持模糊匹配'
        },
        assignees: {
          component: GroupSelectFormatter,
          el: {
            multiple: true,
            url: '/api/v1/tickets/tickets/request-asset-perm/assignees/'
          }
        }
      },
      url: '/api/v1/tickets/tickets/request-asset-perm/',
      createSuccessNextRoute: {
        name: 'TicketList'
      }
    }
  },
  created() {

  },
  methods: {
    performSubmit(validValues) {
      const ips = validValues.ips
      if (ips) {
        validValues.ips = ips.split(',')
      }
      return this.$axios['post'](this.url, validValues)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
