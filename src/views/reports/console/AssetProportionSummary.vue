<template>
  <div class="box">
    <div class="head">
      <Title :config="titleConfig" />
    </div>
    <div v-if="assetTypes.length > 0" class="asset-type-grid">
      <div
        v-for="item in assetTypes"
        :key="item.label"
        class="asset-type-item"
      >
        <div class="asset-type-item__meta">
          <span class="asset-type-item__name">{{ item.label }}</span>
          <span class="asset-type-item__count">{{ item.total }}</span>
        </div>
        <div class="asset-type-item__track">
          <span
            class="asset-type-item__bar"
            :style="{ width: `${item.percent}%`, backgroundColor: item.color }"
          />
        </div>
      </div>
    </div>
    <div v-else class="no-data">{{ $tc('NoData') }}</div>
  </div>
</template>

<script>
import Title from '@/components/Dashboard/Title.vue'

export default {
  components: {
    Title
  },
  data() {
    return {
      titleConfig: {
        title: this.$t('ProportionOfAssetTypes'),
        tip: this.$t('ProportionOfAssetTypes')
      },
      config: {
        data: []
      }
    }
  },
  computed: {
    totalCount() {
      return this.config.data.reduce((sum, item) => sum + Number(item.total || item.value || 0), 0)
    },
    assetTypes() {
      const colors = ['#1AB394', '#65C8B6', '#F3B44B', '#8F959E', '#535C65', '#29448A', '#8EA0C6', '#C9D2E5']
      return this.config.data.map((item, index) => {
        const total = Number(item.total || item.value || 0)
        return {
          label: item.label || item.name || '-',
          total,
          percent: this.totalCount > 0 ? Math.max((total / this.totalCount) * 100, 2) : 0,
          color: colors[index % colors.length]
        }
      })
    }
  },
  mounted() {
    this.getChartData()
  },
  methods: {
    async getChartData() {
      const url = '/api/v1/index/?total_count_type_to_assets_amount=1'
      const data = await this.$axios.get(url)
      this.config.data = data.total_count_type_to_assets_amount || []
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  padding: var(--space-5, 20px);
  background: var(--surface-panel, #fff);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-5, 20px);
  }
}

.asset-type-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4, 16px) var(--space-6, 24px);
}

.asset-type-item {
  min-width: 0;
}

.asset-type-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2, 8px);
  margin-bottom: var(--space-2, 8px);
  color: var(--N700);
  font-size: var(--font-size-sm, 13px);
  line-height: var(--line-height-sm, 20px);
}

.asset-type-item__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-type-item__count {
  color: var(--N900);
  font-weight: var(--font-weight-medium, 500);
}

.asset-type-item__track {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--N100);
}

.asset-type-item__bar {
  display: block;
  height: 100%;
  min-width: 2px;
  border-radius: inherit;
}

.no-data {
  margin-top: var(--space-2, 8px);
  color: var(--N500);
  font-size: var(--font-size-md, 14px);
  text-align: center;
}

@media (max-width: 1200px) {
  .asset-type-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .asset-type-grid {
    grid-template-columns: 1fr;
  }
}
</style>
