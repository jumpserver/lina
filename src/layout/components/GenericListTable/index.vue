<template>
  <ListTable v-bind="iAttrs" v-on="$listeners" />
</template>

<script>
import ListTable from '@/components/ListTable/index'
import { mapGetters } from 'vuex'
export default {
  name: 'GenericListTable',
  components: {
    ListTable
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
