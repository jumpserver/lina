<template>
  <GenericTicketDetail
    :detail-card-items="detailCardItems"
    :object="object"
    :special-card-items="specialCardItems"
  />
</template>

<script>
import { formatTime, getDateTimeStamp } from '@/utils/index'
import { toSafeLocalDateStr } from '@/utils/common'
import GenericTicketDetail from '@/views/tickets/TicketFlow/components/GenericTicketDetail'

export default {
  name: '',
  components: { GenericTicketDetail },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      comments: ''
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('Type'),
          value: this.object.type.label
        },
        {
          key: this.$t('ApprovalLevel'),
          value: this.object.approval_level.label
        },
        {
          key: this.$t('CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('DateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('DateUpdated'),
          value: toSafeLocalDateStr(this.object.date_updated)
        }
      ]
    },
    specialCardItems() {
      const approvalData = [
        {
          key: this.$t('OneAssigneeType'),
          value: ''
        },
        {
          key: this.$t('OneAssignee'),
          value: ''
        },
        {
          key: this.$t('TwoAssigneeType'),
          value: ''
        },
        {
          key: this.$t('TwoAssignee'),
          value: ''
        }]
      this.object.rules.forEach(item => {
        if (item.level === 1) {
          approvalData[0].value = item.strategy.label
          approvalData[1].value = item.assignees_display.join(',')
        } else {
          approvalData[2].value = item.strategy.label
          approvalData[3].value = item.assignees_display.join(',')
        }
      })
      return approvalData.slice(0, this.object.rules.length * 2)
    }
  },
  methods: {
    formatTime(dateStr) {
      return formatTime(getDateTimeStamp(dateStr))
    },
    toSafeLocalDateStr(dataStr) {
      return toSafeLocalDateStr(dataStr)
    },
    reloadPage() {
      window.location.reload()
    }
  }
}
</script>

<style scoped>
  .assets{
    margin-top: 14px;
  }
  .feed-activity-list .feed-element {
    border-bottom: 1px solid #e7eaec;
  }
  .feed-element > .pull-left {
    margin-right: 10px;
  }
  .feed-element .header-avatar {
    width: 38px;
    height: 38px;
  }
  .box {
    margin-bottom: 15px;
  }
</style>
