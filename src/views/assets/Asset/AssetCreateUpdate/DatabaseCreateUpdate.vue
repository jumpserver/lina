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
      url: `/api/v1/assets/databases/`,
      addFields: this.getAddFields(),
      addFieldsMeta: this.getAddFieldsMeta()
    }
  },
  methods: {
    getAddFields() {
      const platform = this.$context.get('type')
      const baseFields = [[this.$t('Basic'), ['db_name']]]
      let tlsFields = ['use_ssl', 'ca_cert']
      const platformFieldsMap = {
        redis: ['client_cert', 'client_key'],
        postgresql: ['client_cert', 'client_key', 'pg_ssl_mode'],
        mysql: ['client_cert', 'client_key', 'allow_invalid_cert'],
        mariadb: ['client_cert', 'client_key', 'allow_invalid_cert'],
        mongodb: ['client_key', 'allow_invalid_cert']
      }

      if (platformFieldsMap[platform]) {
        tlsFields = tlsFields.concat(platformFieldsMap[platform])
      }
      if (tlsFields.length > 2) {
        const secureField = [this.$t('Secure'), tlsFields, 2]
        baseFields.push(secureField)
      }
      return baseFields
    },
    getAddFieldsMeta() {
      const platform = this.$context.get('type')
      const fieldsMeta = {
        db_name: {
          label: this.$t('DefaultDatabase')
        },
        use_ssl: {
          label: this.$t('UseSSL'),
          helpText: ['mysql', 'mariadb', 'postgresql'].includes(platform)
            ? this.$t('DatabaseSSLBackendHelp')
            : undefined,
          component: 'el-switch',
          on: {
            change: ([event], updateForm) => {
              if (platform === 'postgresql') {
                updateForm({ pg_ssl_mode: event ? 'verify-full' : 'prefer' })
              }
            }
          }
        },
        allow_invalid_cert: {
          label: this.$t('AllowInvalidCert'),
          helpText: this.$t('DatabaseSSLInsecureHelp'),
          hidden: (form) => {
            return !form.use_ssl
          },
          component: 'el-switch'
        },
        ca_cert: {
          label: this.$t('CACertificate'),
          helpText: this.$t('DatabaseSSLCAHelp'),
          hidden: (form) => {
            return !form.use_ssl
          },
          component: UploadKey
        },
        client_cert: {
          label: this.$t('ClientCertificate'),
          helpText: this.$t('DatabaseSSLClientHelp'),
          hidden: (form) => {
            return !form.use_ssl
          },
          component: UploadKey
        },
        client_key: {
          label: this.$t('CertificateKey'),
          helpText: this.$t('DatabaseSSLClientHelp'),
          hidden: (form) => {
            return !form.use_ssl
          },
          component: UploadKey
        },
        pg_ssl_mode: {
          label: this.$t('DatabaseSSLMode'),
          helpText: this.$t('DatabaseSSLModeHelp'),
          hidden: (form) => !form.use_ssl
        }
      }

      fieldsMeta['db_name']['rules'] = []
      if (['mongodb', 'oracle', 'postgresql'].indexOf(platform) !== -1) {
        fieldsMeta['db_name']['rules'] = [rules.Required]
      }
      if (platform === 'oracle') {
        fieldsMeta['db_name']['helpText'] = this.$t('OracleDBNameHelpText')
      }
      return fieldsMeta
    }
  }
}
</script>

<style></style>
