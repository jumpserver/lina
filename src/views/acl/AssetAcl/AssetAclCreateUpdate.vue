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
        users: {
          username_group: '*'
        },
        assets: {
          name_group: '*',
          address_group: '*'
        },
        accounts: {
          username_group: '*'
        }
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('acl.users'), ['users']],
        [this.$t('acl.host'), ['assets']],
        [this.$t('acl.account'), ['accounts']],
        [this.$t('acl.action'), ['action', 'reviewers']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        priority: {
          rules: [rules.Required]
        },
        assets: {
          fields: ['name_group', 'address_group']
        },
        users: {
          fields: ['username_group'],
          fieldsMeta: {

          }
        },
        accounts: {
          fields: ['username_group']
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
        // assets
        formValue.assets.name_group = formValue.assets.name_group.toString()
        formValue.assets.address_group = formValue.assets.address_group.toString()
        // accounts
        formValue.accounts.username_group = formValue.accounts.username_group.toString()
        // users
        formValue.users.username_group = formValue.users.username_group.toString()
        return formValue
      },
      cleanFormValue(value) {
        // assets
        if (!Array.isArray(value.assets.name_group)) {
          value.assets.name_group = value.assets.name_group ? value.assets.name_group.split(',') : []
        }
        if (!Array.isArray(value.assets.address_group)) {
          value.assets.address_group = value.assets.address_group ? value.assets.address_group.split(',') : []
        }
        // accounts
        if (!Array.isArray(value.accounts.username_group)) {
          value.accounts.username_group = value.accounts.username_group ? value.accounts.username_group.split(',') : []
        }
        // users
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
