<template>
  <Page>
    <div v-if="this.$hasPerm('accounts.view_changesecretautomation')">
      <SwitchDate class="switch-date" @change="onChange" />
      <CardSummary :days="days" />
      <el-row :gutter="16">
        <el-col :lg="12" :sm="24">
          <AccountSummary :days="days" />
        </el-col>
        <el-col :lg="12" :sm="24">
          <DataSummary :days="days" />
        </el-col>
      </el-row>
      <FailedAccountSummary />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import SwitchDate from '../components/SwitchDate'
import FailedAccountSummary from './FailedAccountSummary.vue'
import DataSummary from './DataSummary.vue'
import CardSummary from './CardSummary.vue'
import AccountSummary from './AccountSummary.vue'
import Page403 from '@/views/403'

export default {
  components: {
    AccountSummary,
    Page,
    SwitchDate,
    DataSummary,
    FailedAccountSummary,
    CardSummary,
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

<style lang="scss" scoped>

  .page ::v-deep .page-heading {
    display: none;
  }

</style>
