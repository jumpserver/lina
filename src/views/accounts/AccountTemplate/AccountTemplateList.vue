<template>
  <Page>
    <AccountTemplateTable />
  </Page>
</template>

<script>
import AccountTemplateTable from './AccountTemplateTable.vue'
import { Page } from '@/layout/components'

export default {
  name: 'AccountTemplateList',
  components: {
    Page, AccountTemplateTable
  },
  data() {
    return {}
  }
}
</script>
