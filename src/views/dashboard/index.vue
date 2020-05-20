<template>
  <Page>
    <ResourceSummary />
    <DatesLoginSummary />
    <TopAndLatestSummary />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import ResourceSummary from './ResourceSummary'
import DatesLoginSummary from './DatesLoginSummary'
import TopAndLatestSummary from './TopAndLatestSummary'

export default {
  name: 'Dashboard',
  components: {
    Page, DatesLoginSummary, ResourceSummary, TopAndLatestSummary
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
