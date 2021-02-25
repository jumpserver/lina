<template>
  <Page v-bind="$attrs">
    <ListTable ref="ListTable" v-bind="iAttrs" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import ListTable from '@/components/ListTable'
import { mapGetters } from 'vuex'
export default {
  name: 'GenericListPage',
  components: {
    Page, ListTable
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['currentOrg']),
    iAttrs() {
      const attrs = _.cloneDeep(this.$attrs)
      const canCreate = _.get(attrs, 'header-actions.canCreate', null)
      this.$log.debug('Can create: ', canCreate)
      if (canCreate === null && this.currentOrg.is_root) {
        _.set(attrs, 'header-actions.canCreate', false)
      }
      // attrs.headerActions.can
      // console.log()
      return attrs
    }
  }
}
</script>

<style scoped>

</style>
