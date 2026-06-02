<template>
  <BaseReport
    v-bind="$attrs"
    :url="url"
    :nav="nav"
    :title="$t('AuditsDashboard')"
    :disable-charts-padding="true"
    name="AuditsDashboard"
  >
    <SwitchDate class="switch-date" :name="name" @change="onChange" />
    <CardSummary :days="days" />
    <el-row :gutter="16" class="dashboard-grid-row">
      <el-col :span="12" :md="12">
        <DataSummary class="chart-container" :days="days" />
      </el-col>
      <el-col :span="12" :md="12">
        <RightSummary class="chart-container" :days="days" />
      </el-col>
    </el-row>
    <TrendSummary :days="days" />
  </BaseReport>
</template>

<script>
import SwitchDate from '@/components/Dashboard/SwitchDate'
import { getRouteUrl } from '@/utils/vue'
import BaseReport from '../base/BaseReport.vue'
import CardSummary from './components/CardSummary.vue'
import DataSummary from './components/DataSummary'
import RightSummary from './components/RightSummary.vue'
import TrendSummary from './components/TrendSummary'

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
      url: getRouteUrl({ name: 'AuditsReport', path: '/reports/dashboard/audits' }, this.$router)
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
  margin-top: var(--space-4, 16px);
}

.switch-date {
  margin-bottom: var(--space-4, 16px);
}

.dashboard-grid-row {
  margin-top: var(--space-4, 16px);
}
</style>
