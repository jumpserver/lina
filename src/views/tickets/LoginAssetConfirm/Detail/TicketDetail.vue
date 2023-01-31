<template>
  <GenericTicketDetail :object="object" :special-card-items="specialCardItems" />
</template>

<script>
import { STATUS_MAP } from '../../const'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'

export default {
  name: 'AssetTicketDetail',
  components: {
    GenericTicketDetail
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statusMap: this.object.status.value === 'open' ? STATUS_MAP['pending'] : STATUS_MAP[this.object.state.value],
      imageUrl: require('@/assets/img/avatar.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    specialCardItems() {
      const { object } = this
      return object.type === 'login_confirm' ? [] : [
        {
          key: this.$t('acl.apply_login_asset'),
          value: object.rel_snapshot.apply_login_asset
        },
        {
          key: this.$t('acl.apply_login_account'),
          value: object.rel_snapshot.apply_login_account
        },
        {
          key: this.$t('acl.apply_login_user'),
          value: object.rel_snapshot.apply_login_user
        }
      ]
    }
  },
  methods: {}
}
</script>

<style scoped>
</style>
