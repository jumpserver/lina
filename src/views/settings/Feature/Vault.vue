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
          title: this.$t('common.Test'),
          loading: false,
          disabled: !store.getters.publicSettings['VAULT_ENABLED'],
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              '/api/v1/settings/vault/testing/',
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch(() => {
              vm.$log.error('err occur')
            }).finally(() => { btn.loading = false })
          }
        },
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
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      encryptedFields: ['VAULT_HCP_TOKEN'],
      fields: [
        [this.$t('common.Basic'), ['HISTORY_ACCOUNT_CLEAN_LIMIT']],
        [this.$t('setting.AccountStorage'),
          [
            'VAULT_ENABLED',
            'VAULT_HCP_HOST',
            'VAULT_HCP_TOKEN',
            'VAULT_HCP_MOUNT_POINT'
          ]
        ]
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
        VAULT_HCP_HOST: {
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED
          }
        },
        VAULT_HCP_TOKEN: {
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED
          }
        },
        VAULT_HCP_MOUNT_POINT: {
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED
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
