<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import rules from '@/components/Form/DataForm/rules'
import { userJSONSelectMeta } from '@/views/users/const'
import { assetJSONSelectMeta } from '@/views/assets/const'
import { Select2 } from '@/components/Form/FormFields'

export default {
  name: 'AclCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('users.Users'), ['users']],
        [this.$t('terminal.ConnectMethod'), ['connect_methods']],
        [this.$t('common.Action'), ['action', 'reviewers']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        priority: {
          rules: [rules.Required]
        },
        assets: assetJSONSelectMeta(this),
        users: userJSONSelectMeta(this, true),
        connect_methods: {
          component: Select2,
          label: this.$t('terminal.ConnectMethod'),
          el: {
            url: '/api/v1/terminal/components/connect-methods/?flat=1&limit=10&os=all',
            ajax: {
              processResults: (data) => {
                return {
                  results: data,
                  more: false
                }
              }
            }
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
      url: '/api/v1/acls/connect-method-acls/'
    }
  },
  methods: {}
}
</script>

<style>
</style>
