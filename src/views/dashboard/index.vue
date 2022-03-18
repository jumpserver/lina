<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_console|rbac.view_audit')">
      <Announcement />
      <ResourceSummary />
      <DatesLoginSummary />
      <TopAndLatestSummary />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import ResourceSummary from './ResourceSummary'
import DatesLoginSummary from './DatesLoginSummary'
import TopAndLatestSummary from './TopAndLatestSummary'
import Page403 from '@/views/403'

export default {
  name: 'Dashboard',
  components: {
    Page,
    DatesLoginSummary,
    ResourceSummary,
    TopAndLatestSummary,
    Announcement,
    Page403
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
