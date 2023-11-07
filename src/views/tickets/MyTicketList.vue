<template>
  <div>
    <BaseTicketList :url="url" v-bind="$data" />
    <CreateUpdate />
  </div>
</template>

<script>
import BaseTicketList from './BaseTicketList'
import CreateUpdate from './RequestAssetPerm/CreateUpdate.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'MyTicketList',
  components: {
    BaseTicketList,
    CreateUpdate
  },
  data() {
    return {
      extraTicketAction: {
        moreCreates: {
          dropdown: [
            {
              name: 'RequestAssetPerm',
              title: this.$t('tickets.RequestAssetPerm'),
              callback: () => {
                const url = '/api/v1/tickets/apply-asset-tickets/?state=pending'
                this.$eventBus.$emit('showCreateUpdateDrawer', 'create', { url })
              }
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
