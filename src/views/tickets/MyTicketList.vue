<template>
  <BaseTicketList :url="url" v-bind="$data" />
</template>

<script>
import BaseTicketList from './BaseTicketList'
import { mapGetters } from 'vuex'
export default {
  name: 'MyTicketList',
  components: {
    BaseTicketList
  },
  data() {
    return {
      extraTicketAction: {
        moreCreates: {
          dropdown: [
            {
              name: 'RequestAssetPerm',
              title: this.$t('tickets.RequestAssetPerm'),
              callback: () => this.$router.push({
                name: 'RequestAssetPermTicketCreateUpdate'
              })
            }
          ]
        }
      }
    }
  },
  computed: {
    url() {
      return `/api/v1/tickets/tickets/?applicant=${this.currentUser.id}`
    },
    ...mapGetters([
      'currentUser'
    ])
  }
}
</script>

<style scoped>

</style>
