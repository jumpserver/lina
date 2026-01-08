<template>
  <HomeCard :table-config="tableConfig" v-bind="cardConfig" />
</template>

<script lang="jsx">
import HomeCard from './HomeCard'
import { mapGetters } from 'vuex'
import { toSafeLocalDateStr } from '@/utils/common/time'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import i18n from '@/i18n/i18n'

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
        title: i18n.global.t('AwaitingMyApproval'),
        icon: 'fa-check-square-o',
        dataArr: []
      },
      tableConfig: {
        url: this.url,
        columns: ['title', 'applicant', 'type', 'status', 'date_created'],
        columnsMeta: {
          title: {
            label: i18n.global.t('Title'),
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute: function ({ row }) {
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
            label: i18n.global.t('User'),
            formatter: row => {
              return row.rel_snapshot.applicant
            }
          },
          type: {
            label: i18n.global.t('Type'),
            width: '130px',
            formatter: row => {
              return row.type.label
            }
          },
          status: {
            align: 'center',
            width: '120px',
            formatter: row => {
              if (row.status.value === 'open') {
                return (
                  <el-tag type="primary" size="small">
                    {' '}
                    {i18n.global.t('OpenStatus')}
                  </el-tag>
                )
              } else {
                return (
                  <el-tag type="danger" size="small">
                    {' '}
                    {i18n.global.t('CloseStatus')}
                  </el-tag>
                )
              }
            }
          },
          date_created: {
            label: i18n.global.t('Date'),
            formatter: row => toSafeLocalDateStr(row.date_created)
          }
        },
        hasSelection: false,
        paginationSize: 10
      }
    }
  },

  computed: {
    ...mapGetters(['currentUser'])
  },
  watch: {
    url(iNew) {
      this.$set(
        this.tableConfig,
        'url',
        `${iNew}?assignees__id=${this.currentUser.id}&state=pending`
      )
    }
  }
}
</script>

<style lang="scss" scoped></style>
