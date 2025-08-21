<template>
  <BaseReport v-bind="$attrs">
    <SwitchDate class="switch-date" :name="name" @change="onChange" />
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

export default {
  components: {
    SwitchDate,
    TrendSummary,
    DataSummary,
    CardSummary,
    RightSummary,
    BaseReport
  },
  data() {
    return {
      name: 'AuditsDashboard',
      days: localStorage.getItem(this.name) || '7'
    }
  },
  methods: {
    onChange(val) {
      this.days = val
    }
  }
}
</script>
