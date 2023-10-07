<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import rules from '@/components/Form/DataForm/rules'
import { userJSONSelectMeta } from '@/views/users/const'
import { assetJSONSelectMeta } from '@/views/assets/const'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'
import { WeekCronSelect } from '@/components/Form/FormFields'

export default {
  name: 'AclCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        accounts: ['@ALL'],
        rules: {
          ip_group: ['*']
        }
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'priority']],
        [this.$t('users.Users'), ['users']],
        [this.$t('assets.Asset'), ['assets']],
        [this.$t('accounts.Accounts'), ['accounts']],
        [this.$t('acl.Rules'), ['rules']],
        [this.$t('common.Action'), ['action', 'reviewers']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        priority: {
          rules: [rules.Required]
        },
        assets: assetJSONSelectMeta(this),
        rules: {
          fields: [
            'ip_group', 'time_period'
          ],
          fieldsMeta: {
            ip_group: {
              label: this.$t('acl.LoginIP'),
              helpText: this.$t('acl.ipGroupHelpText')
            },
            time_period: {
              label: this.$t('common.timePeriod'),
              component: WeekCronSelect
            }
          }
        },
        users: userJSONSelectMeta(this),
        accounts: {
          component: AccountFormatter,
          el: {
            showAddTemplate: false,
            showVirtualAccount: false,
            value: ['@ALL'],
            assets: []
          },
          hidden: (formValue) => {
            const ids = formValue.assets?.ids
            this.fieldsMeta.accounts.el.assets = ids || []
          }
        },
        reviewers: {
          hidden: (formValue) => {
            return !['review', 'notice'].includes(formValue.action)
          },
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
      cleanFormValue(value) {
        if (!Array.isArray(value.rules.ip_group)) {
          value.rules.ip_group = value.rules.ip_group ? value.rules.ip_group.split(',') : []
        }
        if (!['review', 'notice'].includes(value.action)) {
          value.reviewers = []
        }
        return value
      }
    }
  },
  methods: {}
}
</script>

<style>
</style>
