<template><GenericTicketDetail :object="object" :special-card-items="requestItems" /></template>
<script>
import GenericTicketDetail from '../components/GenericTicketDetail'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    requestItems() {
      return (this.object.request_items || []).map((item) => ({
        key: item.label,
        value: Array.isArray(item.value) ? item.value : String(item.value)
      }))
    }
  }
}
</script>
