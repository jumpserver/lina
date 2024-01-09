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
      url: '/api/v1/settings/setting/?category=ris',
      hasReset: false,
      helpText: this.$t('setting.RisHelpText'),
      moreButtons: [
        {
          title: this.$t('common.Test'),
          loading: false,
          disabled: !store.getters.publicSettings['VAULT_ENABLED'],
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              '/api/v1/settings/ris/testing/',
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
              '/api/v1/settings/ris/sync/',
              value
            ).then(res => {
              openTaskPage(res['task'])
            }).catch(() => {
              vm.$log.error('err occur')
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      encryptedFields: ['VAULT_RIS_ACCESS_KEY_SECRET'],
      fields: [
        [
          this.$t('setting.account'),
          [
            'VAULT_ENABLED',
            'VAULT_RIS_AUTH_URL',
            'VAULT_RIS_APP_ID',
            'VAULT_RIS_ACCESS_KEY_ID',
            'VAULT_RIS_ACCESS_KEY_SECRET'
          ]
        ]
      ],
      fieldsMeta: {
        VAULT_ENABLED: {
          disabled: true,
          label: this.$t('setting.EnableRis')
        },
        VAULT_RIS_AUTH_URL: {
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED
          }
        },
        VAULT_RIS_APP_ID: {
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED
          }
        },
        VAULT_RIS_ACCESS_KEY_ID: {
          hidden: (formValue) => {
            return !formValue.VAULT_ENABLED
          }
        },
        VAULT_RIS_ACCESS_KEY_SECRET: {
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
