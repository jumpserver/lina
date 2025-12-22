<template>
  <Page>
    <div v-if="$hasPerm('rbac.view_audit')">
      <Announcement />
      <AuditReport :only-charts="true" :nav="false" />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import Page403 from '@/views/403'
import AuditReport from '@/views/reports/audits/Dashboard.vue'

export default {
  components: {
    Page,
    Announcement,
    Page403,
    AuditReport
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
