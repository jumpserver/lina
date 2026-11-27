<template>
  <GenericTicketDetail
    :object="object"
    :special-card-items="specialCardItems"
    :show-comment="!object.request_items?.some((item) => item.name === 'reason')"
  />
</template>
<script>
import { h } from 'vue'
import GenericTicketDetail from '../../components/GenericTicketDetail'
import LoginReviewReason from '../../components/LoginReviewReason.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    specialCardItems() {
      return (this.object.request_items || []).map((item) => ({
        key: item.label,
        value: item.name === 'apply_login_datetime' ? toSafeLocalDateStr(item.value) : item.value,
        formatter:
          item.name === 'reason' ? (_, value) => h(LoginReviewReason, { value }) : undefined
      }))
    }
  }
}
</script>
