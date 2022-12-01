<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_audit')">
      <Announcement />
      <el-row :gutter="16">
        <el-col :lg="12" :sm="24">
          审计台仪表盘
        </el-col>
        <el-col :lg="12" :sm="24">
          审计台仪表盘
        </el-col>
      </el-row>
      <TrendSummary />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import TrendSummary from './TrendSummary'
import Page403 from '@/views/403'

export default {
  components: {
    Page,
    Announcement,
    TrendSummary,
    Page403
  },
  props: {

  },
  data() {
    return {

    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style scoped>

</style>
