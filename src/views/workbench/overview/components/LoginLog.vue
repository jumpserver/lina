<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import { createTextVNode as createTextVNodeCompat, createVNode as createVNodeCompat } from 'vue'
import HomeCard from './HomeCard'
export default {
  name: 'Log',
  components: {
    HomeCard
  },
  props: {
    headerActions: {
      type: Object,
      default: () => {
        return {
          hasLeftActions: false,
          hasRightActions: false,
          hasSearch: false
        }
      }
    }
  },
  data() {
    return {
      cardConfig: {
        title: this.$t('RecentLogin')
      },
      tableConfig: {
        url: '/api/v1/audits/my-login-logs/?limit=5',
        columns: ['city', 'datetime'],
        columnsMeta: {
          city: {
            formatter: (row) => {
              return createVNodeCompat('span', null, [
                row.city,
                createTextVNodeCompat('('),
                row.ip,
                createTextVNodeCompat(')')
              ])
            }
          },
          actions: {
            has: false
          }
        },
        hasSelection: false,
        paginationSize: 5
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
