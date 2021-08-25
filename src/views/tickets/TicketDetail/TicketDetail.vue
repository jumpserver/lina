<template>
  <GenericTicketDetail :object="object" :detail-card-items="detailCardItems" />
</template>

<script>
import { STATUS_MAP } from '../const'
import { formatTime, getDateTimeStamp } from '@/utils/index'
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
      statusMap: this.object.status === 'open' ? STATUS_MAP['notified'] : STATUS_MAP[this.object.state],
      imageUrl: require('@/assets/img/admin.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('tickets.Applicant'),
          value: this.object.applicant_display
        },
        {
          key: this.$t('tickets.type'),
          value: this.object.type_display
        },
        {
          key: this.$t('tickets.status'),
          value: this.object.status,
          formatter: (item, val) => {
            return <el-tag type={this.statusMap.type} size='mini'> { this.statusMap.title }</el-tag>
          }
        },
        {
          key: this.$t('tickets.Assignees'),
          value: this.object.process_map[this.object.approval_step - 1].assignees_display.join(',')
        },
        {
          key: this.$t('tickets.Assignee'),
          value: this.object.process_map[this.object.approval_step - 1].processor_display
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
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
