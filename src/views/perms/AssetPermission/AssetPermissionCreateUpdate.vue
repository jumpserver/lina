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
import { getDayFuture } from '@/utils/common'
import AccountFormatter from './components/AccountFormatter'
import { AllAccount } from '../const'
import ProtocolsSelect from '@/components/Form/FormFields/AllOrSpec.vue'

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
        [this.$t('common.Basic'), ['name']],
        [this.$t('perms.User'), ['users', 'user_groups']],
        [this.$t('perms.Asset'), ['assets', 'nodes']],
        [this.$t('assets.Account'), ['accounts']],
        [this.$t('assets.Protocol'), ['protocols']],
        [this.$t('perms.Actions'), ['actions']],
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
          label: this.$t('assets.Protocols'),
          el: {
            resource: this.$t('assets.Protocol'),
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

<style lang="scss" scoped>
>>> .el-tree {
  padding: 10px 0;
}

</style>
