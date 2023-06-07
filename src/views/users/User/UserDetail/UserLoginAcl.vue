<template>
  <UserLoginACLTable :url="url" />
</template>

<script>
import UserLoginACLTable from '@/views/acl/UserLoginACL/UserLoginACLTable.vue'

export default {
  name: 'UserLoginAcl',
  components: {
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
