<template>
  <GenericTicketDetail :detail-card-items="detailCardItems" :object="object" />
</template>

<script>
import { STATUS_MAP } from '../const'
import { formatTime, getDateTimeStamp } from '@/utils'
import { toSafeLocalDateStr } from '@/utils/common'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'

export default {
  name: 'TicketDetail',
  components: {
    GenericTicketDetail
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statusMap: this.object.status.value === 'open' ? STATUS_MAP['pending'] : STATUS_MAP[this.object.state.value],
      imageUrl: require('@/assets/img/avatar.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    detailCardItems() {
      const { object } = this
      return [
        {
          key: this.$t('tickets.Applicant'),
          value: object.rel_snapshot.applicant
        },
        {
          key: this.$t('tickets.type'),
          value: object.type.lable
        },
        {
          key: this.$t('tickets.status'),
          value: object.status,
          formatter: (item, val) => {
            return <el-tag type={this.statusMap.type} size='mini'> {this.statusMap.title}</el-tag>
          }
        },
        {
          key: this.$t('tickets.Assignees'),
          value: object.process_map[object.approval_step.value - 1].assignees_display.join(',')
        },
        {
          key: this.$t('tickets.Assignee'),
          value: object.process_map[object.approval_step.value - 1].processor_display
        },
        {
          key: this.$t('common.DateCreated'),
          value: toSafeLocalDateStr(object.date_created)
        }
      ]
    }
  },
  methods: {
    formatTime(dateStr) {
      return formatTime(getDateTimeStamp(dateStr))
    },
    toSafeLocalDateStr(dataStr) {
      return toSafeLocalDateStr(dataStr)
    }
  }
}
</script>

<style scoped>
</style>
