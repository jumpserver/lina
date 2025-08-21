<template>
  <BaseReport
    :url="url"
    :nav="nav"
    :title="$t('AuditsDashboard')"
    name="AuditsDashboard"
    v-bind="$attrs"
  >
    <SwitchDate class="switch-date" :name="name" @change="onChange" />
    <CardSummary :days="days" />
    <div class="charts-grid">
      <DataSummary class="chart-container full-width" :days="days" />
      <RightSummary class="chart-container full-width" :days="days" />
    </div>
    <TrendSummary :days="days" />
  </BaseReport>
</template>

<script>
import SwitchDate from '@/components/Dashboard/SwitchDate'
import TrendSummary from './components/TrendSummary'
import DataSummary from './components/DataSummary'
import CardSummary from './components/CardSummary.vue'
import RightSummary from './components/RightSummary.vue'
import BaseReport from '../base/BaseReport.vue'
import { getRouteUrl } from '@/utils/vue'

export default {
  components: {
    SwitchDate,
    TrendSummary,
    DataSummary,
    CardSummary,
    RightSummary,
    BaseReport
  },
  props: {
    nav: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      name: 'AuditsDashboard',
      days: localStorage.getItem(this.name) || '7',
      url: getRouteUrl('AuditsReport', this.$router)
    }
  },
  methods: {
    onChange(val) {
      this.days = val
    }
  }
}
</script>
<style lang="scss" scoped>
.chart-container {
  margin-top: 16px;
}
</style>
