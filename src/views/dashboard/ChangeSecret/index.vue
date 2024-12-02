<template>
  <Page>
    <div v-if="this.$hasPerm('accounts.view_changesecretautomation')">

      <div>
        <SwitchDate class="switch-date" @change="onChange" />
      </div>

      <el-row type="flex">

        <el-col :span="18">
          <CardSummary class="card-summary" :days="days" />
        </el-col>

        <el-col :span="6">
          <DataSummary class="data-summary" :days="days" style="margin-left: 1rem" />
        </el-col>

      </el-row>

      <el-row type="flex" :gutter="24">
        <FailedAccountSummary :days="days" />
      </el-row>

      <el-row type="flex" style="flex-direction: column">
        <el-col :span="24">
          <AccountSummary class="account-summary" :days="days" />
        </el-col>
      </el-row>

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
