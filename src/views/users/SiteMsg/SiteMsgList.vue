<template>
  <GenericListPage
    ref="GenericListPage"
    :table-config="tableConfig"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, BooleanFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/notifications/site-message/',
        columns: [
          'subject', 'has_read', 'sender', 'date_created'
        ],
        columnsMeta: {
          subject: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'SiteMessageDetail'
            },
            label: this.$t('notifications.Subject')
          },
          has_read: {
            label: this.$t('notifications.HasRead'),
            formatter: BooleanFormatter
          },
          sender: {
            label: this.$t('notifications.Sender')
          },
          date_created: {
            label: this.$t('notifications.DeliveryTime')
          }
        }
      }
    }
  },
  computed: {},
  methods: {}
}
</script>

<style lang="less" scoped>
</style>
