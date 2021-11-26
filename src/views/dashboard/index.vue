<template>
  <Page>
    <ViewModule />
    <Announcement />
    <ResourceSummary />
    <DatesLoginSummary />
    <TopAndLatestSummary />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import ViewModule from './ViewModule'
import ResourceSummary from './ResourceSummary'
import DatesLoginSummary from './DatesLoginSummary'
import TopAndLatestSummary from './TopAndLatestSummary'

export default {
  name: 'Dashboard',
  components: {
    Page,
    ViewModule,
    DatesLoginSummary,
    ResourceSummary,
    TopAndLatestSummary,
    Announcement
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
