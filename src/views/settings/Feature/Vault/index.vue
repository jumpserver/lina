<template>
  <div>
    <el-alert v-sanitize="helpText" type="success" />
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </div>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/Common/IBox/index.vue'
import { openTaskPage } from '@/utils/jms'
import store from '@/store'
import HashiCorpKV from './HCP.vue'
import AzureKV from './Azure.vue'
import AwsSM from './Aws.vue'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/settings/setting/?category=vault',
      hasReset: false,
      helpText: this.$t('VaultHelpText'),
      moreButtons: [
        {
          title: this.$t('Sync'),
          loading: false,
          disabled: !store.getters.publicSettings['VAULT_ENABLED'],
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              '/api/v1/settings/vault/sync/',
              value
            ).then(res => {
              openTaskPage(res['task'])
            }).catch(() => {
              vm.$log.error('err occur')
            }).finally(() => {
              btn.loading = false
            })
          }
        }
      ],
      fields: [
        [this.$t('Basic'), ['VAULT_ENABLED', 'VAULT_BACKEND', 'HISTORY_ACCOUNT_CLEAN_LIMIT']],
        [this.$t('Provider'), ['HCP', 'AZURE', 'AWS']]
      ],
      fieldsMeta: {
        HISTORY_ACCOUNT_CLEAN_LIMIT: {
          el: {
            autocomplete: 'new-password'
          }
        },
        VAULT_ENABLED: {
          disabled: true
        },
        VAULT_BACKEND: {
          label: this.$t('Provider'),
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED || formValue['VAULT_BACKEND'] === 'local'
          },
          disabled: true
        },
        HCP: {
          label: this.$t('HashicorpVault'),
          component: HashiCorpKV,
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED || formValue['VAULT_BACKEND'] !== 'hcp'
          }
        },
        AZURE: {
          label: this.$t('AzureKeyVault'),
          component: AzureKV,
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED || formValue['VAULT_BACKEND'] !== 'azure'
          }
        },
        AWS: {
          label: this.$t('AmazonSecretsManager'),
          component: AwsSM,
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED || formValue['VAULT_BACKEND'] !== 'aws'
          }
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  }
}
</script>

<style scoped>

</style>
