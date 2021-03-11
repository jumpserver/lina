
<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :perform-submit="performSubmit"
    :after-get-form-value="afterGetFormValue"
    :get-url="getUrl"
  />
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
        action: 'reject',
        ip_group: '*',
        user: this.$route.query.user
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'user', 'ip_group', 'action', 'priority', 'is_active']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        is_active: {
          type: 'checkbox'
        },
        user: {
          el: {
            disabled: true,
            multiple: false,
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        }
      },
      url: `/api/v1/acls/login-acls/`,
      updateSuccessNextRoute: { name: 'UserDetail', params: {
        id: this.$route.query.user
      }},
      createSuccessNextRoute: { name: 'UserDetail', params: {
        id: this.$route.query.user
      }}
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
    getUrl() {
      const params = this.$route.params
      let url = this.url
      if (params.id) {
        url = `${url}${params.id}/?user=${this.$route.query.user}`
      } else {
        url = `${url}?user=${this.$route.query.user}`
      }
      return url
    },
    afterGetFormValue(validValues) {
      validValues.ip_group = validValues.ip_group.toString()
      return validValues
    },
    performSubmit(validValues) {
      if (validValues.ip_group) {
        validValues.ip_group = validValues.ip_group.split(',')
      }
      const method = this.getMethod()
      return this.$axios[method](`${this.getUrl()}}`, validValues)
    }
  }
}
</script>

<style>

</style>
