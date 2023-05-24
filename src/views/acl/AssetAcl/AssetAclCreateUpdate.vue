<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import rules from '@/components/DataForm/rules'
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
      initial: {
        accounts: ['@ALL']
      },
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('users.Users'), ['users']],
        [this.$t('assets.Asset'), ['assets']],
        [this.$t('accounts.Accounts'), ['accounts']],
        [this.$t('common.Action'), ['action', 'reviewers']],
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
            value: ['@ALL']
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
      url: '/api/v1/acls/login-asset-acls/'
    }
  },
  methods: {}
}
</script>

<style>
</style>
