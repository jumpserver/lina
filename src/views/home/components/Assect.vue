<template>
  <HomeCard v-bind="cardConfig" :table-config="tableConfig" />
</template>

<script>
import HomeCard from './HomeCard.vue'
import i18n from '@/i18n/i18n'
import { DetailFormatter } from '@/components/TableFormatters'
import { connectivityMeta } from '@/components/AccountListTable/const'

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
          'hostname', 'ip', 'protocols', 'platform', 'hardware_info', 'connectivity'
        ],
        columnsMeta: {
          hostname: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            },
            showOverflowTooltip: true
          },
          protocols: {
            formatter: function(row) {
              return <span> {row.protocols.toString()} </span>
            }
          },
          hardware_info: {
            showOverflowTooltip: true
          },
          connectivity: connectivityMeta
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
