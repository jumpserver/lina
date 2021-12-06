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
        title: i18n.t('route.LoginLog'),
        icon: 'fa-history'
      },
      tableConfig: {
        url: '/api/v1/audits/login-logs/',
        columns: [
          'username', 'ip', 'city',
          'user_agent', 'reason', 'status', 'datetime'
        ],
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          user_agent: {
            width: '150px',
            showOverflowTooltip: true
          },
          status: {
            width: '85px',
            formatterArgs: {
              classChoices: {
                true: 'text-primary',
                false: 'text-danger'
              }
            }
          },
          datetime: {
            width: '160px'
          },
          reason: {
            showOverflowTooltip: true
          }
        },
        hasSelection: false,
        paginationSize: 5
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
