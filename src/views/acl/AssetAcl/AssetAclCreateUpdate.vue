<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import rules from '@/components/DataForm/rules'
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
        priority: {
          rules: [rules.Required]
        },
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
      url: '/api/v1/acls/login-asset-acls/',
      afterGetFormValue(formValue) {
        formValue.assets.ip_group = formValue.assets.ip_group.toString()
        formValue.assets.hostname_group = formValue.assets.hostname_group.toString()
        formValue.system_users.name_group = formValue.system_users.name_group.toString()
        formValue.system_users.protocol_group = formValue.system_users.protocol_group.toString()
        formValue.system_users.username_group = formValue.system_users.username_group.toString()
        formValue.users.username_group = formValue.users.username_group.toString()
        return formValue
      },
      cleanFormValue(value) {
        if (!Array.isArray(value.assets.ip_group)) {
          value.assets.ip_group = value.assets.ip_group ? value.assets.ip_group.split(',') : []
        }
        if (!Array.isArray(value.assets.hostname_group)) {
          value.assets.hostname_group = value.assets.hostname_group ? value.assets.hostname_group.split(',') : []
        }
        if (!Array.isArray(value.system_users.protocol_group)) {
          value.system_users.protocol_group = value.system_users.protocol_group ? value.system_users.protocol_group.split(',') : []
        }
        if (!Array.isArray(value.system_users.name_group)) {
          value.system_users.name_group = value.system_users.name_group ? value.system_users.name_group.split(',') : []
        }
        if (!Array.isArray(value.system_users.username_group)) {
          value.system_users.username_group = value.system_users.username_group ? value.system_users.username_group.split(',') : []
        }
        if (!Array.isArray(value.users.username_group)) {
          value.users.username_group = value.users.username_group ? value.users.username_group.split(',') : []
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
