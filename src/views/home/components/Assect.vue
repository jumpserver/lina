<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import HomeCard from './HomeCard.vue'
import i18n from '@/i18n/i18n'

export default {
  name: 'Assect',
  components: {
    HomeCard
  },
  data() {
    return {
      i18n,
      cardConfig: {
        title: this.$t('route.AssetAclList'),
        icon: 'fa-inbox'
      },
      tableConfig: {
        url: '/api/v1/assets/assets/',
        columns: [
          'hostname', 'ip', 'platform'
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
