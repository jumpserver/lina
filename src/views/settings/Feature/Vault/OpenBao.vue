<template>
  <BaseKV :config="$data" :title="$tc('OpenBao')" />
</template>

<script>
import { UploadKey } from '@/components'
import BaseKV from './Base.vue'

export default {
  name: 'OpenBaoKV',
  components: {
    BaseKV
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=openbao`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function (value, form, btn) {
            btn.loading = true
            vm.$axios
              .post('/api/v1/settings/vault/openbao/testing/', value)
              .then((res) => {
                vm.$message.success(res['msg'])
              })
              .catch(() => {
                vm.$log.error('err occur')
              })
              .finally(() => {
                btn.loading = false
              })
          }
        }
      ],
      encryptedFields: ['VAULT_OPENBAO_TOKEN', 'VAULT_OPENBAO_CACERT_CONTENT'],
      fields: [
        [
          this.$t('AccountStorage'),
          [
            'VAULT_OPENBAO_ADDR',
            'VAULT_OPENBAO_TOKEN',
            'VAULT_OPENBAO_MOUNT_POINT',
            'VAULT_OPENBAO_TIMEOUT',
            'VAULT_OPENBAO_VERIFY_TLS',
            'VAULT_OPENBAO_CACERT_CONTENT'
          ]
        ]
      ],
      fieldsMeta: {
        VAULT_OPENBAO_ADDR: {
          helpText: this.$t('VaultOpenBaoAddr'),
          helpTextAsTip: true
        },
        VAULT_OPENBAO_MOUNT_POINT: {
          helpText: this.$t('VaultOpenBaoMountPoint'),
          helpTextAsTip: true
        },
        VAULT_OPENBAO_VERIFY_TLS: {
          label: this.$t('SSHCAVerifyTLS')
        },
        VAULT_OPENBAO_CACERT_CONTENT: {
          component: UploadKey,
          label: this.$t('CACertificate'),
          hidden: (formValue) => !formValue.VAULT_OPENBAO_VERIFY_TLS,
          el: {
            accept: '.crt,.pem,.cer'
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

<style scoped></style>
