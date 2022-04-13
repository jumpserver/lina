<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import HomeCard from './HomeCard'
import { mapGetters } from 'vuex'
import { toSafeLocalDateStr } from '@/utils/common'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  name: 'HomeAnnouncement',
  components: {
    HomeCard
  },
  props: {
    url: {
      type: String,
      default: () => '/api/v1/tickets/tickets/'
    }
  },
  data() {
    return {
      cardConfig: {
        title: this.$t('tickets.AssignedMe'),
        icon: 'fa-check-square-o',
        dataArr: []
      },
      tableConfig: {
        url: this.url,
        columns: [
          {
            prop: 'title',
            label: this.$t('tickets.title'),
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute: function({ row }) {
                if (row.type === 'apply_asset') {
                  return 'AssetsTicketDetail'
                } else if (row.type === 'apply_application') {
                  return 'AppsTicketDetail'
                } else if (row.type === 'login_asset_confirm' || row.type === 'login_confirm') {
                  return 'LoginAssetTicketDetail'
                } else if (row.type === 'command_confirm') {
                  return 'CommandConfirmDetail'
                } else {
                  return 'TicketDetail'
                }
              }
            }
          },
          {
            prop: 'applicant_display',
            label: this.$t('tickets.user')
          },
          {
            prop: 'type_display',
            label: this.$t('tickets.type')
          },
          {
            prop: 'date_created',
            label: this.$t('tickets.date'),
            formatter: (row) => toSafeLocalDateStr(row.date_created)
          }
        ],
        hasSelection: false,
        paginationSize: 10
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentUser'
    ])
  },
  watch: {
    url(iNew) {
      this.$set(this.tableConfig, 'url', `${iNew}?applicant=${this.currentUser.id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
