<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import rules from '@/components/DataForm/rules'
import { cleanFormValueForHandleUserAssetAccount } from '../common'

export default {
  name: 'AclCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
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
          fieldsMeta: {}
        },
        accounts: {
          fields: ['username_group']
        },
        reviewers: {
          hidden: (item) => item.action !== 'review',
          rules: [rules.RequiredChange],
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
      cleanFormValue: cleanFormValueForHandleUserAssetAccount
    }
  },
  methods: {}
}
</script>

<style>
</style>
