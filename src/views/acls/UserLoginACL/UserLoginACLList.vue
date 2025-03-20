<template>
  <Page :help-tip="helpMsg">
    <UserLoginACLTable />
  </Page>

</template>

<script>
import UserLoginACLTable from '@/views/acls/UserLoginACL/UserLoginACLTable.vue'
import Page from '@/layout/components/Page'

export default {
  components: {
    UserLoginACLTable,
    Page
  },
  data() {
    return {
      helpMsg: this.$t('UserLoginACLHelpMsg')
    }
  }
}
</script>
