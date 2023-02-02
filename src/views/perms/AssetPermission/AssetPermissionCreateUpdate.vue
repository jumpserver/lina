<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :fields-meta="fieldsMeta"
    :initial="initial"
    :url="url"
    v-bind="$data"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import AssetSelect from '@/components/AssetSelect'
import { getDayFuture } from '@/utils/common'
import AccountFormatter from './components/AccountFormatter'

export default {
  name: 'AccountFormatter',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const nodesInitial = []
    if (this.$route.query['node']) {
      nodesInitial.push(this.$route.query.node)
    }
    const assetsInitial = []
    if (this.$route.query['asset']) {
      assetsInitial.push(this.$route.query.asset)
    }
    return {
      initial: {
        is_active: true,
        date_start: new Date().toISOString(),
        date_expired: getDayFuture(36500, new Date()).toISOString(),
        nodes: nodesInitial,
        assets: assetsInitial,
        accounts: ['@ALL']
      },
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('perms.User'), ['users', 'user_groups']],
        [this.$t('perms.Asset'), ['assets', 'nodes', 'accounts']],
        [this.$t('common.action'), ['actions']],
        [this.$t('common.Other'), ['is_active', 'date_start', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/asset-permissions/',
      createSuccessNextRoute: { name: 'AssetPermissionDetail' },
      fieldsMeta: {
        users: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        },
        user_groups: {
          el: {
            value: [],
            url: '/api/v1/users/groups/'
          }
        },
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('perms.Asset'),
          rules: [{
            required: false
          }],
          el: {
            value: []
          }
        },
        nodes: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              transformOption: (item) => {
                return { label: item.full_value, value: item.id }
              }
            }
          }
        },
        accounts: {
          type: 'input',
          label: this.$t('perms.Account'),
          component: AccountFormatter,
          helpText: this.$t('perms.AccountsHelp')
        },
        actions: {
          label: this.$t('perms.Actions'),
          helpText: this.$t('common.actionsTips')
        },
        date_start: {
          label: this.$t('common.DateStart')
        },
        date_expired: {
          label: this.$t('common.dateExpired')
        },
        comment: {
          label: this.$t('common.Comment')
        },
        is_active: {
          type: 'checkbox'
        }
      },
      cleanFormValue(value) {
        if (!Array.isArray(value.accounts)) {
          value.accounts = value.accounts ? value.accounts.split(',') : []
        }
        return value
      }
    }
  }
}
</script>

<style scoped>

</style>
