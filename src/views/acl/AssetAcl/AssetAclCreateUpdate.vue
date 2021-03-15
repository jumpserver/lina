
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
        action: 'login_confirm',
        system_users: {
          name_group: '*',
          protocol_group: '*',
          username_group: '*'
        },
        users: {
          username_group: '*'
        },
        assets: {
          hostname_group: '*',
          ip_group: '*'
        }
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('acl.users'), ['users']],
        [this.$t('acl.asset'), ['assets']],
        [this.$t('acl.system_user'), ['system_users']],
        [this.$t('acl.action'), ['action', 'reviewers']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        assets: {
          fields: ['hostname_group', 'ip_group']
        },
        users: {
          fields: ['username_group'],
          fieldsMeta: {

          }
        },
        system_users: {
          fields: ['name_group', 'username_group', 'protocol_group']
        },
        reviewers: {
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
      url: '/api/v1/acls/login-asset-acls/'
    }
  },
  methods: {
    getUrl() {
      const params = this.$route.params
      let url = `/api/v1/acls/login-asset-acls/`
      if (params.id) {
        url = `${url}${params.id}`
      } else {
        url = `${url}`
      }
      return url
    },
    getMethod() {
      const params = this.$route.params
      if (params.id) {
        return 'put'
      } else {
        return 'post'
      }
    },
    afterGetFormValue(validValues) {
      validValues.assets.ip_group = validValues.assets.ip_group.toString()
      validValues.assets.hostname_group = validValues.assets.hostname_group.toString()
      validValues.system_users.name_group = validValues.system_users.name_group.toString()
      validValues.system_users.protocol_group = validValues.system_users.protocol_group.toString()
      validValues.system_users.username_group = validValues.system_users.username_group.toString()
      validValues.users.username_group = validValues.users.username_group.toString()
      return validValues
    },
    performSubmit(validValues) {
      if (!Array.isArray(validValues.assets.ip_group)) {
        validValues.assets.ip_group = validValues.assets.ip_group ? validValues.assets.ip_group.split(',') : []
      }
      if (!Array.isArray(validValues.assets.hostname_group)) {
        validValues.assets.hostname_group = validValues.assets.hostname_group ? validValues.assets.hostname_group.split(',') : []
      }
      if (!Array.isArray(validValues.system_users.protocol_group)) {
        validValues.system_users.protocol_group = validValues.system_users.protocol_group ? validValues.system_users.protocol_group.split(',') : []
      }
      if (!Array.isArray(validValues.system_users.name_group)) {
        validValues.system_users.name_group = validValues.system_users.name_group ? validValues.system_users.name_group.split(',') : []
      }
      if (!Array.isArray(validValues.system_users.username_group)) {
        validValues.system_users.username_group = validValues.system_users.username_group ? validValues.system_users.username_group.split(',') : []
      }
      if (!Array.isArray(validValues.users.username_group)) {
        validValues.users.username_group = validValues.users.username_group ? validValues.users.username_group.split(',') : []
      }
      const method = this.getMethod()
      return this.$axios[method](`${this.getUrl()}`, validValues)
    }
  }
}
</script>

<style>

</style>
