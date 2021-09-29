<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :after-get-form-value="afterGetFormValue"
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
        user: this.$route.query.user,
        users: {
          username_group: ''
        }
      },
      url: '/api/v1/acls/login-acls/',
      fields: [
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('acl.users'), ['user', 'users']],
        [this.$t('acl.Rules'), ['ip_group']],
        [this.$t('acl.Action'), ['action', 'reviewers']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        is_active: {
          type: 'checkbox'
        },
        user: {
          el: {
            disabled: !!this.$route.query.user,
            multiple: false,
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini&all=true',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        },
        users: {
          fields: ['username_group'],
          hidden: (form) => {
            return this.$route.query.user
          },
          fieldsMeta: {

          }
        },
        reviewers: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini&all=true',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          },
          hidden: (formValue) => {
            return formValue.action !== 'confirm'
          }
        }
      },
      getUrl() {
        const query = this.$route.query
        const params = this.$route.params
        let url = `/api/v1/acls/login-acls/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        if (query.user) {
          url = `${url}?user=${query.user}`
        }
        return url
      },
      updateSuccessNextRoute: this.$route.query.user ? { name: 'UserDetail', params: {
        id: this.$route.query.user
      }} : { name: 'UserLoginACLList' },
      createSuccessNextRoute: this.$route.query.user ? { name: 'UserDetail', params: {
        id: this.$route.query.user
      }} : { name: 'UserLoginACLList' },
      onPerformError(error, method, vm) {
        this.$emit('submitError', error)
        const response = error.response
        const data = response.data
        if (response.status === 400) {
          for (const key of Object.keys(data)) {
            let value = data[key]
            if (key === 'ip_group') {
              value = Object.values(data[key])
            }
            if (value instanceof Array) {
              value = value.join(';')
            }
            this.$refs.form.setFieldError(key, value)
          }
        }
      },
      afterGetFormValue(validValues) {
        validValues.ip_group = validValues.ip_group.toString()
        if (!this.$route.query.user) {
          validValues.users.username_group = validValues.users.username_group.toString()
        }
        return validValues
      },
      cleanFormValue(value) {
        if (!Array.isArray(value.ip_group)) {
          value.ip_group = value.ip_group ? value.ip_group.split(',') : []
        }
        if (!this.$route.query.user) {
          if (!Array.isArray(value.users.username_group)) {
            value.users.username_group = value.users.username_group ? value.users.username_group.split(',') : []
          }
        } else {
          delete value.users
        }
        if (value.action !== 'confirm') {
          value.reviewers = []
        }
        return value
      }
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style>

</style>
