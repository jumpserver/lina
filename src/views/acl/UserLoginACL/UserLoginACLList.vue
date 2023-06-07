<template>
  <Page>
    <UserLoginACLTable />
  </Page>

</template>

<script>
import UserLoginACLTable from '@/views/acl/UserLoginACL/UserLoginACLTable.vue'
import Page from '@/layout/components/Page'

export default {
  components: {
    UserLoginACLTable,
    Page
  },
  data() {
    return {}
  }
}
</script>

<style>

</style>
