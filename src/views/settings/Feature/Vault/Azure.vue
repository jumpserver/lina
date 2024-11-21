<template>
  <BaseKV :config="$data" :title="$tc('AzureKeyVault')" />
</template>

<script>
import BaseKV from './Base.vue'

export default {
  name: 'AzureKV',
  components: {
    BaseKV
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=azure_kv`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              '/api/v1/settings/vault/azure/testing/',
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch(() => {
              vm.$log.error('err occur')
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      encryptedFields: ['VAULT_AZURE_CLIENT_SECRET'],
      fields: [
        [this.$t('AccountStorage'),
          [
            'VAULT_AZURE_HOST',
            'VAULT_AZURE_CLIENT_ID',
            'VAULT_AZURE_CLIENT_SECRET',
            'VAULT_AZURE_TENANT_ID'
          ]
        ]
      ],
      fieldsMeta: {
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
