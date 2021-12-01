<template>
  <Hcard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import Hcard from './Hcard.vue'
import i18n from '@/i18n/i18n'

export default {
  name: 'Assect',
  components: {
    Hcard
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
        paginationSize: 5
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
