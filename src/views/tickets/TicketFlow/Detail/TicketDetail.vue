<template>
  <GenericTicketDetail :detail-card-items="detailCardItems" :object="object" />
</template>

<script>
import { h } from 'vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import GenericTicketDetail from '@/views/tickets/TicketFlow/components/GenericTicketDetail'
import CcUsers from '@/views/tickets/components/CcUsers'

export default {
  name: '',
  components: { CcUsers, GenericTicketDetail },
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
          key: this.$t('Name'),
          value: this.object.name || this.object.type.label
        },
        {
          key: this.$t('ApprovalLevel'),
          value: this.object.approval_level.label
        },
        {
          key: this.$t('CcUsers'),
          value: this.object.cc_users,
          formatter: (item, users) => h(CcUsers, { users })
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
