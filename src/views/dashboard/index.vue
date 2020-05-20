<template>
  <Page>
    <ResourceSummary />
    <DatesLoginSummary />
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import ResourceSummary from './ResourceSummary'
import DatesLoginSummary from './DatesLoginSummary'

export default {
  name: 'Dashboard',
  components: {
    Page, DatesLoginSummary, ResourceSummary
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
