
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
}
</script>

<style>

</style>
