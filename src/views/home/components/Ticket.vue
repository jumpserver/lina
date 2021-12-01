<template>
  <Hcard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import Hcard from './Hcard.vue'
import i18n from '@/i18n/i18n'
import { mapGetters } from 'vuex'

export default {
  name: 'Hannouncement',
  components: {
    Hcard
  },
  props: {
    url: {
      type: String,
      default: () => '/api/v1/tickets/tickets/'
    }
  },
  data() {
    return {
      i18n,
      cardConfig: {
        title: this.$t('tickets.AssignedMe'),
        icon: 'fa-check-square-o',
        dataArr: []
      },
      tableConfig: {
        url: this.url,
        columns: [
          'title', 'type', 'date'
        ],
        paginationSize: 5
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentUser'
    ])
  },
  watch: {
    url(iNew) {
      this.$set(this.tableConfig, 'url', `${iNew}?applicant=${this.currentUser.id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
