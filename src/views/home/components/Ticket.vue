<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import HomeCard from './HomeCard.vue'
import { mapGetters } from 'vuex'
import { toSafeLocalDateStr } from '@/utils/common'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  name: 'Hannouncement',
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
                } else if (row.type === 'login_asset_confirm') {
                  return 'loginAssetTicketDetail'
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
            label: this.$t('tickets.type'),
            width: '160px'
          },
          {
            prop: 'status',
            label: this.$t('tickets.status'),
            align: 'center',
            width: '90px',
            formatter: row => {
              if (row.status === 'open') {
                return <el-tag type='primary' size='mini'style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.OpenStatus') }</el-tag>
              } else {
                return <el-tag type='danger' size='mini'style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.CloseStatus') }</el-tag>
              }
            }
          },
          {
            prop: 'action',
            label: this.$t('tickets.action'),
            align: 'center',
            width: '90px',
            formatter: row => {
              if (row.status === 'open') {
                return <el-tag type='success' size='mini'style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Pending') }</el-tag>
              }
              switch (row.state) {
                case 'approved':
                  return <el-tag type='primary' size='mini' style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Approved') }</el-tag>
                case 'rejected':
                  return <el-tag type='danger' size='mini' style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Rejected') }</el-tag>
                default :
                  return <el-tag type='info' size='mini' style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Closed') }</el-tag>
              }
            }
          },
          {
            prop: 'date_created',
            label: this.$t('tickets.date'),
            formatter: (row) => toSafeLocalDateStr(row.date_created),
            width: '160px'
          }
        ],
        hasSelection: false,
        paginationSize: 5
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
