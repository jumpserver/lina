<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :perform-submit="performSubmit"
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
        user: this.$route.query.user
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'user', 'ip_group', 'action', 'priority']],
        [this.$t('common.Other'), ['is_active', 'comment']]
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
      updateSuccessNextRoute: { name: 'UserDetail', params: {
        id: this.$route.query.user
      }},
      createSuccessNextRoute: { name: 'UserDetail', params: {
        id: this.$route.query.user
      }},
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
        return validValues
      },
      cleanFormValue(value) {
        if (!Array.isArray(value.ip_group)) {
          value.ip_group = value.ip_group ? value.ip_group.split(',') : []
        }
        return value
      }
    }
  },
  methods: {
  }
}
</script>

<style>

</style>
