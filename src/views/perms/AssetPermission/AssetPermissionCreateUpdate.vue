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
import AssetSelect from '@/components/Apps/AssetSelect'
import { getDayFuture } from '@/utils/time'
import AccountFormatter from './components/AccountFormatter'
import { AllAccount } from '../const'
import ProtocolsSelect from '@/components/Form/FormFields/AllOrSpec.vue'
import RealFormatter from './components/RealFormatter.vue'
import VirtualFormatter from './components/VirtualFormatter.vue'

export default {
  name: 'AccountFormatter',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const nodesInitial = []
    if (this.$route.query['node_id']) {
      nodesInitial.push(this.$route.query.node_id)
    }
    const assetsInitial = []
    if (this.$route.query['asset_id']) {
      assetsInitial.push(this.$route.query.asset_id)
    }
    return {
      initial: {
        is_active: true,
        date_start: new Date().toISOString(),
        date_expired: getDayFuture(25550, new Date()).toISOString(),
        nodes: nodesInitial,
        assets: assetsInitial,
        accounts: [AllAccount]
      },
      fields: [
        [this.$t('Basic'), ['name']],
        [this.$t('User'), ['users', 'user_groups']],
        [this.$t('Asset'), ['assets', 'nodes']],
        [this.$t('Account'), ['real_accounts', 'virtual_accounts']],
        [this.$t('Protocol'), ['protocols']],
        [this.$t('Action'), ['actions']],
        [this.$t('Other'), ['is_active', 'date_start', 'date_expired', 'comment']]
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
          rules: [{
            required: false
          }],
          el: {
            value: [],
            treeSetting: {
              showSearch: false,
              showRefresh: false
            }
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
        protocols: {
          component: ProtocolsSelect,
          el: {
            resource: this.$t('Protocol'),
            select2: {
              url: '/api/v1/assets/protocols/',
              ajax: {
                transformOption: (item) => {
                  return { label: item.label, value: item.value }
                }
              }
            }
          }
        },
        accounts: {
          type: 'input',
          component: AccountFormatter,
          el: {
            assets: [],
            nodes: []
          },
          hidden: (formValue) => {
            this.fieldsMeta.accounts.el.assets = formValue.assets
            this.fieldsMeta.accounts.el.nodes = formValue.nodes
          }
        },
        real_accounts: {
          component: RealFormatter
        },
        virtual_accounts: {
          component: VirtualFormatter
        },
        actions: {
          label: this.$t('Action'),
          helpText: this.$t('ActionsTips')
        },
        date_start: {},
        date_expired: {},
        comment: {},
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

<style lang="scss" scoped>
::v-deep .el-tree {
  padding: 5px 0;
}

</style>
