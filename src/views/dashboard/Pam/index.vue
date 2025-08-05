<template>
  <Page>
    <div v-if="$hasPerm('rbac.view_pam')">
      <Announcement />
      <PamReport :nav="false" />

    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import { Announcement } from '@/components'
import Page403 from '@/views/403'
import PamReport from '@/views/reports/pam/Dashboard/index.vue'

export default {
  name: 'Dashboard',
  components: {
    Page,
    Page403,
    Announcement,
    PamReport
  },
  data() {
    return {
      url: '/api/v1/accounts/pam-dashboard/?total_count_type_to_accounts=1'
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
