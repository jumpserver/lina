<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_audit')">
      <Announcement />
      <SwitchDate class="switch-date" @change="onChange" />
      <CardSummary :days="days" />
      <el-row :gutter="16">
        <el-col :lg="12" :sm="24">
          <DataSummary :days="days" />
        </el-col>
        <el-col :lg="12" :sm="24">
          <RightSummary :days="days" />
        </el-col>
      </el-row>
      <TrendSummary :days="days" />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import SwitchDate from '@/components/Dashboard/SwitchDate'
import TrendSummary from './TrendSummary'
import DataSummary from './DataSummary'
import CardSummary from './CardSummary.vue'
import RightSummary from './RightSummary.vue'
import Page403 from '@/views/403'

export default {
  components: {
    Page,
    Announcement,
    SwitchDate,
    TrendSummary,
    DataSummary,
    CardSummary,
    RightSummary,
    Page403
  },
  data() {
    return {
      days: localStorage.getItem('dashboardDays') || '7'
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
