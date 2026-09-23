<template><GenericTicketDetail :object="object" /></template>
<script>
import GenericTicketDetail from '../components/GenericTicketDetail'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } }
}
</script>
