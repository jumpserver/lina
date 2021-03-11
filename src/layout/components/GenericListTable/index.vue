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
    ...mapGetters(['currentOrgIsRoot']),
    iAttrs() {
      const attrs = _.cloneDeep(this.$attrs)
      const canCreate = _.get(attrs, 'header-actions.canCreate', null)
      this.$log.debug('Can create: ', canCreate)
      if (canCreate === null && this.currentOrgIsRoot) {
        _.set(attrs, 'header-actions.canCreate', false)
      }
      return attrs
    }
  }
}
</script>

<style scoped>

</style>
