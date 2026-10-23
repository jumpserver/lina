<template><GenericTicketDetail :object="object" :special-card-items="requestItems" /></template>
<script>
import { getTicketPlugin } from '../plugins/registry'
import GenericTicketDetail from '../components/GenericTicketDetail'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    requestItems() {
      const plugin = getTicketPlugin(this.object.type?.value)
      const labels = { duration: 'WFFieldValidity', ...plugin.requestLabels }
      return (this.object.request_items || []).map((item) => ({
        name: item.name,
        key: labels[item.name] ? this.$t(labels[item.name]) : item.label,
        value: plugin.dateFields?.includes(item.name)
          ? toSafeLocalDateStr(item.value)
          : plugin.requestChoices?.[item.name]?.[item.value]
            ? this.$t(plugin.requestChoices[item.name][item.value])
            : (item.value ?? '-')
      }))
    }
  }
}
</script>
