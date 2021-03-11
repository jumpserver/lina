
<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" :perform-submit="performSubmit" :after-get-form-value="afterGetFormValue" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'AclCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        priority: 20,
        action: 'reject'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'users', 'ip_group', 'action', 'priority']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {

        users: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        }
      },
      url: '/api/v1/acls/login-acls/'
    }
  },
  methods: {
    getMethod() {
      const params = this.$route.params
      if (params.id) {
        return 'put'
      } else {
        return 'post'
      }
    },
    afterGetFormValue(validValues) {
      validValues.ip_group = validValues.ip_group.toString()
      return validValues
    },
    performSubmit(validValues) {
      if (validValues.ip_group) {
        validValues.ip_group = validValues.ip_group.split(',')
      }
      const baseUrl = `/api/v1/acls/login-acls/`
      const method = this.getMethod()
      return this.$axios[method](`${baseUrl}`, validValues)
    }
  }
}
</script>

<style>

</style>
