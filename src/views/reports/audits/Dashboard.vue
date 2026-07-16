<template>
  <BaseReport
    :url="url"
    :nav="nav"
    :title="$t('AuditsDashboard')"
    :disable-charts-padding="true"
    name="AuditsDashboard"
    v-bind="$attrs"
  >
    <SwitchDate class="switch-date" :name="name" :days="days" @change="onChange" />
    <template v-if="initialized">
      <CardSummary :days="days" />
      <el-row class="summary-row" :gutter="10">
        <el-col class="summary-column" :span="12" :md="12">
          <DataSummary class="chart-container summary-card" :days="days" />
        </el-col>
        <el-col class="summary-column" :span="12" :md="12">
          <RightSummary class="chart-container summary-card" :days="days" />
        </el-col>
      </el-row>
      <TrendSummary :days="days" />
    </template>
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
import { scopedLocalStorage as localStorage } from '@/utils/storage'

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
      days: '',
      initialized: false,
      url: getRouteUrl('AuditsReport', this.$router)
    }
  },
  created() {
    this.days = this.resolveDays()
    this.initialized = true
  },
  methods: {
    resolveDays() {
      return String(this.$route.query.days || localStorage.getItem(this.name) || '7')
    },
    onChange(val) {
      this.days = String(val)
    }
  }
}
</script>
<style lang="scss" scoped>
.chart-container {
  margin-top: 16px;
}

.summary-row {
  align-items: stretch;
}

.summary-column {
  display: flex;
}

.summary-card {
  flex: 1 1 auto;
}
</style>
