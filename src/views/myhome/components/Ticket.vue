<template>
  <HomeCard :table-config="tableConfig" v-bind="cardConfig" />
</template>

<script>
import HomeCard from './HomeCard'
import { mapGetters } from 'vuex'
import { toSafeLocalDateStr } from '@/utils/common'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'HomeAnnouncement',
  components: {
    HomeCard
  },
  props: {
    url: {
      type: String,
      default: () => `/api/v1/tickets/tickets/`
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
        columns: ['title', 'applicant', 'type', 'status', 'date_created'],
        columnsMeta: {
          title: {
            label: this.$t('tickets.title'),
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute: function({ row }) {
                const type = row.type.value
                if (type === 'apply_asset') {
                  return 'AssetsTicketDetail'
                } else if (type === 'login_asset_confirm') {
                  return 'LoginAssetTicketDetail'
                } else if (type === 'login_confirm') {
                  return 'LoginTicketDetail'
                } else if (type === 'command_confirm') {
                  return 'CommandConfirmDetail'
                } else {
                  return 'TicketDetail'
                }
              }
            }
          },
          actions: {
            has: false
          },
          applicant: {
            label: this.$t('tickets.user'),
            formatter: row => {
              return row.rel_snapshot.applicant
            }
          },
          type: {
            label: this.$t('tickets.type'),
            width: '160px',
            formatter: row => {
              return row.type.label
            }
          },
          status: {
            align: 'center',
            width: '90px',
            formatter: row => {
              if (row.status.value === 'open') {
                return <el-tag type='primary' size='mini'> {this.$t('tickets.OpenStatus')}</el-tag>
              } else {
                return <el-tag type='danger' size='mini'>  {this.$t('tickets.CloseStatus')}</el-tag>
              }
            }
          },
          date_created: {
            label: this.$t('tickets.date'),
            formatter: (row) => toSafeLocalDateStr(row.date_created)
          }
        },
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
      this.$set(this.tableConfig, 'url', `${iNew}?assignees__id=${this.currentUser.id}&state=pending`)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
