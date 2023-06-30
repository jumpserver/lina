<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/IBox'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/settings/setting/?category=vault',
      moreButtons: [
        {
          title: this.$t('setting.testTools'),
          loading: false,
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
      encryptedFields: ['HCP_VAULT_TOKEN'],
      fields: [
        [
          this.$t('setting.Vault'),
          [
            'VAULT_TYPE',
            'HCP_VAULT_HOST',
            'HCP_VAULT_TOKEN',
            'HCP_VAULT_MOUNT_POINT'
          ]
        ]
      ],
      fieldsMeta: {
        HCP_VAULT_HOST: {
          hidden: (formValue) => {
            return formValue.VAULT_TYPE === 'local'
          }
        },
        HCP_VAULT_TOKEN: {
          hidden: (formValue) => {
            return formValue.VAULT_TYPE === 'local'
          }
        },
        HCP_VAULT_MOUNT_POINT: {
          hidden: (formValue) => {
            return formValue.VAULT_TYPE === 'local'
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
