<template>
  <ListTable ref="ListTable" v-bind="$attrs" v-on="$listeners" />
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
    ...mapGetters(['currentOrgIsRoot'])
  },
  created() {
    const headerActions = this.$attrs['header-actions'] || {}
    if (headerActions.canCreate === undefined && this.currentOrgIsRoot) {
      _.set(this.$attrs, 'header-actions.canCreate', false)
    }
  }
}
</script>

<style scoped>

</style>
