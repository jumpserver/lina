<template>
  <Page>
    <div v-if="this.$hasPerm('rbac.view_console')">
      <Announcement />
      <ConsoleReport :nav="false" />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import Page403 from '@/views/403'
import ConsoleReport from '@/views/reports/Console/index.vue'

export default {
  name: 'Dashboard',
  components: {
    Page,
    Announcement,
    Page403,
    ConsoleReport
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
