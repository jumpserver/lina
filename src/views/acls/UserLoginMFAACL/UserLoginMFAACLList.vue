<template>
  <Page :help-tip="helpMsg">
    <UserLoginMFAACLTable />
  </Page>
</template>

<script>
import UserLoginMFAACLTable from '@/views/acls/UserLoginMFAACL/UserLoginMFAACLTable.vue'
import Page from '@/layout/components/Page'

export default {
  components: {
    UserLoginMFAACLTable,
    Page
  },
  data() {
    return {
      helpMsg: this.$t('UserLoginMFAACLHelpMsg')
    }
  }
}
</script>
