<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import rules from '@/components/DataForm/rules'
import { cleanFormValueForHandleUserAssetAccount } from '../common'
import { userJSONSelectMeta } from '@/views/users/const'
import { assetJSONSelectMeta } from '@/views/assets/const'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'

export default {
  name: 'AclCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('acl.users'), ['users']],
        [this.$t('acl.host'), ['assets']],
        [this.$t('acl.account'), ['accounts']],
        [this.$t('acl.action'), ['action', 'reviewers']],
        [this.$t('common.Other'), ['priority', 'is_active', 'comment']]
      ],
      fieldsMeta: {
        priority: {
          rules: [rules.Required]
        },
        assets: assetJSONSelectMeta(this),
        users: userJSONSelectMeta(this),
        accounts: {
          component: AccountFormatter,
          el: {
            showAddTemplate: false,
            showVirtualAccount: false,
            value: {}
          }
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
