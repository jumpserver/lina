<template>
  <ListTable ref="ListTable" v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import ListTable from '@/components/ListTable/index'
import { mapGetters } from 'vuex'
import { hasPermission, getResourceFromApiUrl } from '@/utils/jms'

export default {
  name: 'GenericListTable',
  components: {
    ListTable
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  created() {
    this.setDefaultAction()
  },
  methods: {
    getRequiredPerms(action) {
      const url = this.$attrs['table-config']['url']
      const { app, resource } = getResourceFromApiUrl(url)
      return [`${app}.${action}_${resource}`]
    },
    hasActionPerm(action) {
      const permsRequired = this.getRequiredPerms(action)
      const has = hasPermission(permsRequired)
      this.$log.debug('Action perm required: ', permsRequired, has)
      return has
    },
    isRootOrgOrNoPerm(action) {
      const permsRequired = this.getRequiredPerms(action)
      this.$log.debug('Is root perm required: ', permsRequired)
      return this.currentOrgIsRoot || !hasPermission(permsRequired)
    },
    setDefaultAction() {
      const headerActions = this.$attrs['header-actions'] || {}
      if (headerActions.canCreate === undefined && this.isRootOrgOrNoPerm('add')) {
        _.set(this.$attrs, 'header-actions.canCreate', false)
      }
      if (headerActions.hasImport === undefined && this.isRootOrgOrNoPerm('add')) {
        _.set(this.$attrs, 'header-actions.hasImport', false)
      }
      if (headerActions.hasBulkDelete === undefined && !this.hasActionPerm('del')) {
        _.set(this.$attrs, 'header-actions.hasBulkDelete', false)
      }
      if (headerActions.hasBulkUpdate === undefined && !this.hasActionPerm('change')) {
        _.set(this.$attrs, 'header-actions.hasBulkUpdate', false)
      }
    }
  }
}
</script>

<style scoped>

</style>
