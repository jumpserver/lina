<template><GenericTicketDetail :object="object" :special-card-items="specialCardItems" /></template>
<script>
import GenericTicketDetail from '../../components/GenericTicketDetail'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    specialCardItems() {
      return (this.object.request_items || []).map((item) => ({
        key: item.label,
        value: item.name === 'apply_login_datetime' ? toSafeLocalDateStr(item.value) : item.value
      }))
    }
  }
}
</script>
