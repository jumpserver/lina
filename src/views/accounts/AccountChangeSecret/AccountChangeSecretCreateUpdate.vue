<template>
  <GenericCreateUpdatePage v-if="ready" v-bind="$data" @get-object-done="handleObjectDone" />
</template>

<script>
import { AutomationParams } from '@/components'
import { NodeSelect, ResourceSelect } from '@/components/Form/FormFields'
import { GenericCreateUpdatePage } from '@/layout/components'
import { getChangeSecretFields } from '@/views/accounts/AccountChangeSecret/fields'
import { choiceValue, getApplicationCredential } from '@/api/applicationCredential'

export default {
  name: 'AccountChangeSecretCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      ready: false,
      pamRotation: null,
      hasSaveContinue: true,
      node_ids: [],
      asset_ids: [],
      initial: {
        is_periodic: false,
        password_rules: {
          length: 36
        },
        interval: 24,
        accounts: [],
        secret_type: 'password',
        secret_strategy: 'specific',
        ssh_key_change_strategy: 'set_jms'
      },
      url: '/api/v1/accounts/change-secret-automations/',
      encryptedFields: ['secret'],
      fields: [
        [this.$t('Basic'), ['name']],
        [this.$t('Asset'), ['accounts', 'assets', 'nodes']],
        [
          this.$t('SecretKeyStrategy'),
          [
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
        [this.$t('Other'), ['check_conn_after_change', 'is_active', 'recipients', 'comment']]
      ],
      fieldsMeta: {
        ...getChangeSecretFields(),
        assets: {
          type: 'resourceSelect',
          component: ResourceSelect,
          rules: [{ required: false }],
          el: {
            value: [],
            url: '/api/v1/assets/assets/?change_secret_enabled=true&fields_size=mini',
            resourceName: this.$t('Assets'),
            nodeFilter: {
              treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
              typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
              includeDescendants: true
            }
          },
          on: {
            input: ([value]) => {
              this.asset_ids = value
            }
          }
        },
        nodes: {
          type: 'nodeSelect',
          component: NodeSelect,
          rules: [{ required: false }],
          el: {
            value: [],
            url: '/api/v1/assets/nodes/?fields_size=mini',
            treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
            resourceName: this.$t('Nodes')
          },
          on: {
            input: ([value]) => {
              this.node_ids = value || []
            }
          }
        },
        params: {
          component: AutomationParams,
          el: {
            method: 'change_secret_method',
            assets: this.asset_ids,
            nodes: this.node_ids
          }
        },
        recipients: {
          type: 'resourceSelect',
          component: ResourceSelect,
          helpText: this.$t('OnlyMailSend'),
          el: {
            value: [],
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
          }
        }
      },
      createSuccessNextRoute: { name: 'AccountChangeSecretList' },
      updateSuccessNextRoute: { name: 'AccountChangeSecretList' },
      afterGetRemoteMeta: this.handleAfterGetRemoteMeta,
      cleanFormValue: (data) => {
        if (this.pamRotation) {
          data.rotation_id = this.pamRotation.id
          data.is_periodic = false
          data.check_conn_after_change = true
          data.nodes = []
        }
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
  async created() {
    const credentialId = this.$route.query.application_credential
    if (this.$route.name === 'AccountChangeSecretCreate' && credentialId) {
      const credential = await getApplicationCredential(credentialId)
      this.pamRotation = credential.rotation
      if (!this.pamRotation || this.pamRotation.id !== this.$route.query.credential_rotation) {
        throw new Error(this.$t('PamRotationExpired'))
      }
      this.pamRotation.credential_id = credential.id
      this.asset_ids = [credential.asset.id]
      Object.assign(this.initial, {
        name: `${credential.name}-${this.$t('ChangeSecret')}-${this.pamRotation.id.slice(0, 8)}`,
        assets: this.asset_ids,
        accounts: [credential.primary_account.username],
        secret_type: choiceValue(credential.primary_account.secret_type),
        secret_strategy: 'random',
        is_periodic: false,
        check_conn_after_change: true
      })
      this.configurePamForm()
      this.fieldsMeta.params.el.assets = this.asset_ids
    }
    this.ready = true
  },
  watch: {
    node_ids: {
      handler(val) {
        this.fieldsMeta.params.el.nodes = val
      },
      deep: true
    },
    asset_ids: {
      handler(val) {
        this.fieldsMeta.params.el.assets = val
      },
      deep: true
    }
  },
  methods: {
    configurePamForm() {
      if (!this.pamRotation) return
      for (const name of [
        'assets',
        'accounts',
        'nodes',
        'secret_type',
        'is_periodic',
        'check_conn_after_change'
      ]) {
        const field = this.fieldsMeta[name] || (this.fieldsMeta[name] = {})
        field.el = { ...field.el, disabled: true }
      }
      this.hasSaveContinue = false
      const route = {
        name: 'IntegrationApplicationList',
        query: { tab: 'rotations', credential_id: this.pamRotation.credential_id }
      }
      this.createSuccessNextRoute = route
      this.updateSuccessNextRoute = route
    },
    handleObjectDone({ assets = [], nodes = [], rotation = null }) {
      this.pamRotation = rotation || this.pamRotation
      this.configurePamForm()
      this.asset_ids = assets.map((item) => item.id || item.pk || item)
      this.node_ids = nodes.map((item) => item.id || item.pk || item)
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
