<template>
  <BaseReport v-bind="$attrs" :url="url"
    :nav="nav"
    :title="$t('AuditsDashboard')"
    :disable-charts-padding="true"
    name="AuditsDashboard">
    <SwitchDate class="switch-date" :name="name" @change="onChange" />
    <CardSummary :days="days" />
    <el-row :gutter="10">
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
    let reportUrl = '/reports/dashboard/audits'
    try {
      reportUrl = getRouteUrl('AuditsReport', this.$router) || reportUrl
    } catch (e) {
      console.warn('Failed to resolve AuditsReport route:', e)
    }
    return {
      name: 'AuditsDashboard',
      days: localStorage.getItem(this.name) || '7',
      url: reportUrl
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
