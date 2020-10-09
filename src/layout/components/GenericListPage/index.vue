<template>
  <Page v-bind="$attrs">
    <ListTable ref="ListTable" v-bind="$attrs" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import ListTable from '@/components/ListTable'
export default {
  name: 'GenericListPage',
  components: {
    Page, ListTable
  }
}
</script>

<style scoped>

</style>
