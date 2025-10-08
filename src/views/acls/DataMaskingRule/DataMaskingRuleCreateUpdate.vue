<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { userJSONSelectMeta } from '@/views/users/const'
import { assetJSONSelectMeta } from '@/views/assets/const'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'

export default {
  name: 'DataMaskingRuleCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        accounts: ['@ALL']
      },
      fields: [
        [this.$t('Basic'), ['name', 'priority']],
        [this.$t('Users'), ['users']],
        [this.$t('Asset'), ['assets']],
        [this.$t('Accounts'), ['accounts']],
        [this.$t('Rules'), ['fields_pattern', 'masking_method', 'mask_pattern']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        assets: assetJSONSelectMeta(this),
        users: userJSONSelectMeta(this),
        accounts: {
          component: AccountFormatter,
          el: {
            showAddTemplate: false,
            enableVirtualAccount: false,
            value: ['@ALL'],
            assets: []
          },
          hidden: (formValue) => {
            const ids = formValue.assets?.ids
            this.fieldsMeta.accounts.el.assets = ids || []
          }
        },
        mask_pattern: {
          hidden: (formValue) => {
            return !['fixed_char'].includes(formValue.masking_method)
          }
        }
      },
      url: '/api/v1/acls/data-masking-rules/'
    }
  },
  methods: {}
}
</script>

<style>
</style>
