<template>
  <TwoCol>
    <UserLoginACLTable :url="url" />
  </TwoCol>
</template>

<script>
import UserLoginACLTable from '@/views/acls/UserLoginACL/UserLoginACLTable.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'UserLoginACL',
  components: {
    TwoCol,
    UserLoginACLTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      url: '/api/v1/acls/login-acls/?users=' + this.object.id
    }
  }

}
</script>

<style scoped>

</style>
