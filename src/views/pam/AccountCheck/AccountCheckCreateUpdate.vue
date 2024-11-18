<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getChangeSecretFields } from '@/views/accounts/AccountChangeSecret/fields'
import { AssetSelect } from '@/components'
import { crontab, interval, is_periodic } from '@/views/accounts/const'
import i18n from '@/i18n/i18n'

export default {
  name: 'AccountPushCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      nodeIds: [],
      assetIds: [],
      isAssetType: '',
      initial: {
        is_periodic: false,
        password_rules: {
          length: 30
        },
        interval: 24,
        secret_type: 'password',
        secret_strategy: 'specific'
      },
      url: '/api/v1/accounts/check-account-automations/',
      encryptedFields: ['secret'],
      fields: [
        [this.$t('Basic'), ['name']],
        [this.$t('Asset'), ['assets', 'nodes']],
        [this.$t('Check config'), ['engines', 'recipients']],
        [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        ...getChangeSecretFields(),
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          rules: [
            { required: false }
          ],
          el: {
            baseUrl: '/api/v1/assets/assets/?push_account_enabled=true'
          },
          on: {
            input: ([value]) => {
              this.assetIds = value
            }
          }
        },
        engines: {
          el: {
            url: '/api/v1/accounts/account-check-engines/',
            multiple: true,
            ajax: {
              transformOption: (item) => {
                let name = item.name
                let disabled = false
                if (item.slug === 'check_gathered_account') {
                  name = `${name} (使用创建账号发现任务替代)`
                  disabled = true
                }
                return { label: name, value: item.id, disabled: disabled }
              }
            }
          }
        },
        recipients: {
          label: i18n.t('Recipients'),
          helpText: i18n.t('OnlyMailSend'),
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
        nodes: {
          el: {
            multiple: true,
            ajax: {
              transformOption: (item) => {
                return { label: item['full_value'], value: item.id }
              },
              url: '/api/v1/assets/nodes/'
            }
          },
          on: {
            input: ([value]) => {
              this.nodeIds = value?.map(i => i.pk)
            }
          }
        },
        username: {
          hidden: (formValue) => formValue['dynamic_username']
        },
        ssh_key_change_strategy: {
          hidden: (formValue) => formValue['action'] !== 'create_and_push' ||
            formValue['secret_type'] !== 'ssh_key'
        },
        triggers: {
          el: {
            readonly: true
          }
        },
        is_periodic,
        crontab,
        interval
      },
      createSuccessNextRoute: { name: 'AccountCheckList' },
      updateSuccessNextRoute: { name: 'AccountCheckList' },
      afterGetRemoteMeta: this.handleAfterGetRemoteMeta,
      cleanFormValue(data) {
        const secretType = data.secret_type || ''
        if (secretType !== 'password') {
          data.secret = data[secretType]
          delete data[secretType]
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
  mounted() {
    if (!this.$store.getters.hasValidLicense) {
      delete this.fields[3]
    }
  },
  methods: {
    hasType(type) {
      return this.isAssetType.indexOf(type) > -1
    },
    handleAfterGetRemoteMeta(meta) {
      const needSetOptionFields = [
        'secret_type', 'secret_strategy', 'ssh_key_change_strategy'
      ]
      for (const i of needSetOptionFields) {
        const field = this.fieldsMeta[i] || {}
        field.options = meta[i]?.choices || []
      }
    }
  }
}
</script>

<style scoped>

</style>
