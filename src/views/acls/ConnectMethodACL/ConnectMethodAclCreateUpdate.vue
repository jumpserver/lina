<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import { ResourceSelect, Select2 } from '@/components/Form/FormFields'
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetJSONSelectMeta } from '@/views/assets/const'
import { userJSONSelectMeta } from '@/views/users/const'

export default {
  name: 'ACLCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
      fields: [
        [this.$t('Basic'), ['name']],
        [this.$t('Users'), ['users']],
        [this.$t('ConnectMethod'), ['connect_methods']],
        [this.$t('Action'), ['action', 'reviewers']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        assets: assetJSONSelectMeta(this),
        users: userJSONSelectMeta(this, true),
        connect_methods: {
          component: Select2,
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
          type: 'resourceSelect',
          component: ResourceSelect,
          hidden: (item) => item.action !== 'review',
          rules: [rules.RequiredChange],
          el: {
            value: [],
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
          }
        }
      },
      url: '/api/v1/acls/connect-method-acls/'
    }
  },
  methods: {}
}
</script>

<style></style>
