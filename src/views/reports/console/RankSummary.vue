<template>
  <div class="rank-summary">
    <RankTable :config="userConfig" />
    <RankTable :config="assetConfig" />
  </div>
</template>

<script>
import RankTable from '@/components/Dashboard/RankTable.vue'

export default {
  components: {
    RankTable
  },
  data() {
    return {
      userConfig: {
        title: this.$t('LoginUserRanking'),
        url: '/api/v1/index/?dates_login_times_top10_users=1',
        tip: this.$t('LoginUserRanking'),
        data: 'dates_login_times_top10_users',
        columns: [
          {
            prop: 'user',
            label: this.$t('Username')
          },
          {
            prop: 'total',
            label: this.$t('LoginCount')
          }
        ]
      },
      assetConfig: {
        title: this.$t('ActiveAssetRanking'),
        url: '/api/v1/index/?dates_login_times_top10_assets=1',
        tip: this.$t('ActiveAssetRanking'),
        data: 'dates_login_times_top10_assets',
        columns: [
          {
            prop: 'asset',
            label: this.$t('AssetName')
          },
          {
            prop: 'total',
            label: this.$t('NumberOfVisits')
          }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.rank-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4, 16px);
  align-items: stretch;
}

@media (max-width: 1200px) {
  .rank-summary {
    grid-template-columns: 1fr;
  }
}
</style>
