<template>
  <div>
    <el-alert type="success" v-html="helpText" />
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </div>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/IBox/index.vue'
import { openTaskPage } from '@/utils/jms'
import store from '@/store'
import HashiCorpKV from './HCP.vue'
import AzureKV from './Azure.vue'

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
      helpText: this.$t('setting.VaultHelpText'),
      moreButtons: [
        {
          title: this.$t('setting.sync'),
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
        [this.$t('common.Basic'), ['VAULT_ENABLED', 'VAULT_BACKEND', 'HISTORY_ACCOUNT_CLEAN_LIMIT']],
        [this.$t('setting.SMSProvider'), ['HCP', 'AZURE']]
      ],
      fieldsMeta: {
        HISTORY_ACCOUNT_CLEAN_LIMIT: {
          el: {
            autocomplete: 'new-password'
          }
        },
        VAULT_ENABLED: {
          disabled: true,
          label: this.$t('setting.EnableVaultStorage')
        },
        VAULT_BACKEND: {
          label: this.$t('setting.VaultProvider'),
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED
          }
        },
        HCP: {
          label: this.$t('setting.HashicorpVault'),
          component: HashiCorpKV,
          hidden: (form) => {
            return form['VAULT_BACKEND'] !== 'hcp'
          }
        },
        AZURE: {
          label: this.$t('setting.AzureKeyVault'),
          component: AzureKV,
          hidden: (form) => {
            return form['VAULT_BACKEND'] !== 'azure'
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
