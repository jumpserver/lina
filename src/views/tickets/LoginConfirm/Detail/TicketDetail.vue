<template><GenericTicketDetail :object="object" :special-card-items="specialCardItems" /></template>
<script>
import GenericTicketDetail from '../../components/GenericTicketDetail'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    specialCardItems() {
      return [
        { key: this.$t('IP'), value: this.object.apply_login_ip },
        { key: this.$t('City'), value: this.object.apply_login_city },
        { key: this.$t('Date'), value: this.object.apply_login_datetime }
      ]
    }
  }
}
</script>
