<template>
  <GenericCreateUpdatePage v-bind="$data" :perform-submit="performSubmit" :create-success-next-route="createSuccessNextRoute" />
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
        [this.$t('common.Basic'), ['title', 'ips', 'host_name', 'date_start', 'date_expired', 'assignees']]
      ],
      fieldsMeta: {
        assignees: {
          el: {
            multiple: true,
            ajax: {
              url: '/api/v1/users/users/'
            },
            value: []
          }
        }
      },
      url: '/api/v1/tickets/tickets/apply_for_perm/',
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
