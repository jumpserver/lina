<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'
import { UploadKey } from '@/components'

export default {
  name: 'DatabaseCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/databases/',
      addFields: this.getAddFields(),
      addFieldsMeta: {
        use_ssl: {
          label: this.$t('common.UseSSL'),
          component: 'el-switch'
        },
        allow_invalid_cert: {
          label: this.$t('common.AllowInvalidCert'),
          hidden: (form) => { return !form.use_ssl },
          component: 'el-switch'
        },
        ca_cert: {
          label: this.$t('common.CACertificate'),
          hidden: (form) => { return !form.use_ssl },
          component: UploadKey
        },
        client_cert: {
          label: this.$t('common.ClientCertificate'),
          hidden: (form) => { return !form.use_ssl },
          component: UploadKey
        },
        client_key: {
          label: this.$t('common.CertificateKey'),
          hidden: (form) => { return !form.use_ssl },
          component: UploadKey
        }
      }
    }
  },
  methods: {
    getAddFields() {
      const platform = this.$route.query.platform_type
      const baseFields = [[this.$t('common.Basic'), ['db_name']]]
      let tlsParams = ['use_ssl', 'ca_cert']
      switch (platform) {
        case 'Redis':
          tlsParams = tlsParams.concat(['client_cert', 'client_key'])
          break
        case 'MongoDB':
          tlsParams = tlsParams.concat(['client_key', 'allow_invalid_cert'])
          break
      }
      if (tlsParams.length > 2) {
        const secureField = [
          this.$t('assets.Secure'), tlsParams, 3
        ]
        baseFields.push(secureField)
      }
      return baseFields
    }
  }
}
</script>

<style>
</style>
