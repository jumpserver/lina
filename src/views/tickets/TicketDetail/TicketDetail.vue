<template><GenericTicketDetail :object="object" :special-card-items="requestItems" /></template>
<script>
import GenericTicketDetail from '../components/GenericTicketDetail'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    requestItems() {
      const labels = {
        duration: 'WFFieldValidity',
        session_asset: 'Asset',
        session_account: 'Account',
        session_user: 'User',
        session_date_start: 'DateStart'
      }
      return (this.object.request_items || []).map((item) => ({
        key: labels[item.name] ? this.$t(labels[item.name]) : item.label,
        value:
          item.name === 'session_date_start' ? toSafeLocalDateStr(item.value) : (item.value ?? '-')
      }))
    }
  }
}
</script>
