<template>
  <Page>
    <Announcement />
    <ResourceSummary />
    <DatesLoginSummary />
    <TopAndLatestSummary />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import ResourceSummary from './ResourceSummary'
import DatesLoginSummary from './DatesLoginSummary'
import TopAndLatestSummary from './TopAndLatestSummary'

export default {
  name: 'Dashboard',
  components: {
    Page,
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
