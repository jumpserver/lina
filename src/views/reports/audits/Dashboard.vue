<template>
  <BaseReport
    :url="url"
    :nav="nav"
    :title="$t('AuditsDashboard')"
    name="AuditsDashboard"
    v-bind="$attrs"
  >
    <SwitchDate class="switch-date" @change="onChange" />
    <CardSummary :days="days" />
    <el-row :gutter="16">
      <el-col :lg="12" :md="12" :sm="24">
        <DataSummary :days="days" />
      </el-col>
      <el-col :lg="12" :md="12" :sm="24">
        <RightSummary :days="days" />
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
      days: localStorage.getItem('dashboardDays') || '7',
      url: getRouteUrl('AuditsReport', this.$router)
    }
  },
  methods: {
    onChange(val) {
      this.days = val
      localStorage.setItem('dashboardDays', val)
    }
  }
}
</script>
