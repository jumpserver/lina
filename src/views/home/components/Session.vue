<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import HomeCard from './HomeCard.vue'
import i18n from '@/i18n/i18n'

export default {
  name: 'Announcement',
  components: {
    HomeCard
  },
  data() {
    return {
      i18n,
      cardConfig: {
        title: this.$t('route.SessionOffline'),
        icon: 'fa-rocket'
      },
      tableConfig: {
        url: '/api/v1/audits/login-logs/',
        columns: [
          'ip', 'city', 'datetime'
        ],
        hasSelection: false,
        paginationSize: 5
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
