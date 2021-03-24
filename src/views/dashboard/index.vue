<template>
  <Page>
    <button @click="downloadWithCSS">Download PDF</button>
    <div id="content" ref="content">
      <ResourceSummary />
      <DatesLoginSummary />
      <TopAndLatestSummary />
    </div>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import ResourceSummary from './ResourceSummary'
import DatesLoginSummary from './DatesLoginSummary'
import TopAndLatestSummary from './TopAndLatestSummary'
import { exportPdf } from '@/utils'
import html2canvas from 'html2canvas'

export default {
  name: 'Dashboard',
  components: {
    Page, DatesLoginSummary, ResourceSummary, TopAndLatestSummary
  },
  data() {
    return {
    }
  },
  methods: {
    downloadWithCSS() {
      const name = 'Orange'
      html2canvas(document.getElementById('content'), {
        scale: 2
      }).then(function(canvas) {
        exportPdf(name, [canvas])
      })
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
