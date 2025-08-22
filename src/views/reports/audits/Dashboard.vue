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
