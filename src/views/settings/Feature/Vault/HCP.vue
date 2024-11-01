<template>
  <BaseKV :config="$data" :title="$tc('setting.HashicorpVault')" />
</template>

<script>
import BaseKV from './Base.vue'

export default {
  name: 'HashiCorpKV',
  components: {
    BaseKV
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=hcp`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('common.Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              '/api/v1/settings/vault/hcp/testing/',
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch(() => {
              vm.$log.error('err occur')
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      encryptedFields: ['VAULT_HCP_TOKEN'],
      fields: [
        [this.$t('setting.AccountStorage'),
          [
            'VAULT_HCP_HOST',
            'VAULT_HCP_TOKEN',
            'VAULT_HCP_MOUNT_POINT'
          ]
        ]
      ],
      fieldsMeta: {
        VAULT_HCP_TOKEN: {
          el: {
            autocomplete: 'new-password'
          }
        }
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
