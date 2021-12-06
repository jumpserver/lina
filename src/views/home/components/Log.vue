<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import HomeCard from './HomeCard.vue'
import i18n from '@/i18n/i18n'

export default {
  name: 'Log',
  components: {
    HomeCard
  },
  data() {
    return {
      i18n,
      cardConfig: {
        title: '登录日志',
        icon: 'fa-history',
        dataArr: []
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
