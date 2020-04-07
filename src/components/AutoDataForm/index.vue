<template>
  <DataForm></DataForm>
</template>

<script>
import DataForm from '../DataForm'
export default {
  name: 'AutoDataForm',
  components: {
    DataForm
  },
  props: {
    url: {
      type: String,
      required: true,
      default: '/api/v1/users/users/'
    },
    method: {
      type: String,
      default: 'post'
    },
    fields: {
      type: Array,
      default: () => {
        return ['username', 'name', 'email', 'groups', 'mfa_level', 'source', 'role', 'date_expired', 'phone', 'wechat', 'comment']
      }
    }
  }
}
</script>

<style scoped>

</style>
