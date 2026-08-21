<template>
  <GenericCreateUpdatePage v-bind="$data" @get-object-done="handleObjectDone" />
</template>

<script>
import { AutomationParams } from '@/components'
import { periodicMeta } from '@/components/const'
import { ResourceSelect, TagInput, TreeResourceSelect } from '@/components/Form/FormFields'
import { GenericCreateUpdatePage } from '@/layout/components'
import { getChangeSecretFields } from '@/views/accounts/AccountChangeSecret/fields'
import AccountPushPasswordRule from './AccountPushPasswordRule.vue'

export default {
  name: 'AccountPushCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const changeSecretFields = getChangeSecretFields()

    return {
      nodeIds: [],
      assetIds: [],
      isAssetType: '',
      initial: {
        is_periodic: false,
        password_rules: {
          length: 36
        },
        interval: 24,
        secret_type: 'password',
        secret_strategy: 'specific'
      },
      url: '/api/v1/accounts/push-account-automations/',
      encryptedFields: ['secret'],
      fields: [
        [this.$t('Basic'), ['name']],
        [this.$t('Asset'), ['assets', 'nodes']],
        [
          this.$t('Account'),
          [
            'accounts',
            'secret_strategy',
            'secret_type',
            'secret',
            'password_rules',
            'ssh_key_change_strategy',
            'ssh_key',
            'passphrase'
          ]
        ],
        [this.$t('Params'), ['params']],
        [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']],
        [this.$t('Other'), ['check_conn_after_change', 'is_active', 'comment']]
      ],
      fieldsMeta: {
        ...periodicMeta,
        ...changeSecretFields,
        password_rules: {
          ...changeSecretFields.password_rules,
          component: AccountPushPasswordRule
        },
        assets: {
          type: 'resourceSelect',
          component: ResourceSelect,
          rules: [{ required: false }],
          el: {
            value: [],
            url: '/api/v1/assets/assets/?push_account_enabled=true&fields_size=mini',
            resourceName: this.$t('Assets'),
            nodeFilter: {
              treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
              typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
              includeDescendants: true
            }
          },
          on: {
            input: ([value]) => {
              this.assetIds = value
            }
          }
        },
        nodes: {
          type: 'treeResourceSelect',
          component: TreeResourceSelect,
          rules: [{ required: false }],
          el: {
            value: [],
            url: '/api/v1/assets/nodes/?fields_size=mini',
            treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
            resourceName: this.$t('Nodes')
          },
          on: {
            input: ([value]) => {
              this.nodeIds = value || []
            }
          }
        },
        username: {
          hidden: (formValue) => formValue['dynamic_username']
        },
        ssh_key_change_strategy: {
          hidden: (formValue) =>
            formValue['action'] !== 'create_and_push' || formValue['secret_type'] !== 'ssh_key'
        },
        triggers: {
          el: {
            readonly: true
          }
        },
        accounts: {
          component: TagInput,
          helpText: this.$t('PushAccountHelpText')
        },
        params: {
          component: AutomationParams,
          label: this.$t('PushParams'),
          el: {
            method: 'push_account_method',
            assets: this.assetIds,
            nodes: this.nodeIds
          },
          helpText: this.$t('ParamsHelpText')
        }
      },
      createSuccessNextRoute: { name: 'AccountPushList' },
      updateSuccessNextRoute: { name: 'AccountPushList' },
      afterGetRemoteMeta: this.handleAfterGetRemoteMeta,
      cleanFormValue(data) {
        const secretType = data.secret_type || ''
        if (secretType !== 'password') {
          data.secret = data[secretType]
          delete data[secretType]
        }

        if (data.ssh_key_change_strategy === 'add') {
          data.ssh_key_change_strategy = this.initial.ssh_key_change_strategy
        }
        return data
      }
    }
  },
  computed: {
    isUpdate() {
      return this.$route.path.indexOf('/update') > -1
    }
  },
  watch: {
    nodeIds: {
      handler(val) {
        this.fieldsMeta.params.el.nodes = val
      },
      deep: true
    },
    assetIds: {
      handler(val) {
        this.fieldsMeta.params.el.assets = val
      },
      deep: true
    }
  },
  methods: {
    handleObjectDone({ assets = [], nodes = [] }) {
      this.assetIds = assets.map((item) => item.id || item.pk || item)
      this.nodeIds = nodes.map((item) => item.id || item.pk || item)
    },
    handleAfterGetRemoteMeta(meta) {
      const needSetOptionFields = ['secret_type', 'secret_strategy', 'ssh_key_change_strategy']
      for (const i of needSetOptionFields) {
        const field = this.fieldsMeta[i] || {}
        field.options = meta[i]?.choices || []
      }
    }
  }
}
</script>

<style scoped></style>
