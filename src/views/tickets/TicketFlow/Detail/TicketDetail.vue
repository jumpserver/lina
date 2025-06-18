<template>
  <GenericTicketDetail
    :detail-card-items="detailCardItems"
    :object="object"
  />
</template>

<script>
import { toSafeLocalDateStr } from '@/utils/common/time'
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
    }
  },
  methods: {
    toSafeLocalDateStr(dataStr) {
      return toSafeLocalDateStr(dataStr)
    }
  }
}
</script>

<style scoped>
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
