<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'
import { UploadKey } from '@/components'
import rules from '@/components/Form/DataForm/rules'

export default {
  name: 'DatabaseCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/databases/',
      addFields: this.getAddFields(),
      addFieldsMeta: this.getAddFieldsMeta()
    }
  },
  mounted() {
    this.url = `${this.url}?platform=${this.$route.query.platform}`
  },
  methods: {
    getAddFields() {
      const platform = this.$route.query.type
      const baseFields = [[this.$t('common.Basic'), ['db_name']]]
      let tlsFields = ['use_ssl', 'ca_cert']
      switch (platform) {
        case 'redis':
          tlsFields = tlsFields.concat(['client_cert', 'client_key'])
          break
        case 'mysql':
          tlsFields = tlsFields.concat(['client_cert', 'client_key', 'allow_invalid_cert'])
          break
        case 'mongodb':
          tlsFields = tlsFields.concat(['client_key', 'allow_invalid_cert'])
          break
      }
      if (tlsFields.length > 2) {
        const secureField = [
          this.$t('assets.Secure'), tlsFields, 2
        ]
        baseFields.push(secureField)
      }
      return baseFields
    },
    getAddFieldsMeta() {
      const platform = this.$route.query.type
      const fieldsMeta = {
        db_name: {
          label: this.$t('assets.DefaultDatabase')
        },
        use_ssl: {
          label: this.$t('common.UseSSL'),
          component: 'el-switch'
        },
        allow_invalid_cert: {
          label: this.$t('common.AllowInvalidCert'),
          hidden: (form) => {
            return !form.use_ssl
          },
          component: 'el-switch'
        },
        ca_cert: {
          label: this.$t('common.CACertificate'),
          hidden: (form) => {
            return !form.use_ssl
          },
          component: UploadKey
        },
        client_cert: {
          label: this.$t('common.ClientCertificate'),
          hidden: (form) => {
            return !form.use_ssl
          },
          component: UploadKey
        },
        client_key: {
          label: this.$t('common.CertificateKey'),
          hidden: (form) => {
            return !form.use_ssl
          },
          component: UploadKey
        }
      }
      if (['mongodb', 'postgresql'].indexOf(platform) !== -1) {
        fieldsMeta['db_name']['rules'] = [rules.Required]
      }
      if (platform === 'oracle') {
        fieldsMeta['db_name']['helpText'] = this.$t('assets.OracleDBNameHelpText')
      }
      return fieldsMeta
    }
  }
}
</script>

<style>
</style>
