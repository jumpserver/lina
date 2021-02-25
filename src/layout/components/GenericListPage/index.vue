<template>
  <Page v-bind="$attrs">
    <ListTable ref="ListTable" v-bind="iAttrs" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import ListTable from '@/components/ListTable'
export default {
  name: 'GenericListPage',
  components: {
    Page, ListTable
  },
  data() {
    return {}
  },
  computed: {
    iAttrs() {
      const attrs = _.cloneDeep(this.$attrs)
      const canCreate = _.get(attrs, 'header-actions.canCreate', null)
      if (canCreate === null) {
        _.set(attrs, 'header-actions.canCreate', false)
      }
      // attrs.headerActions.can
      // console.log()
      console.log('After change: ', attrs)
      return attrs
    }
  }
}
</script>

<style scoped>

</style>
