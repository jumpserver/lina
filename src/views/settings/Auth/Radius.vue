<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_RADIUS"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { UpdateToken } from '@/components/Form/FormFields'
import { Select2 } from '@/components'

export default {
  name: 'Cas',
  components: {
    BaseAuth
  },
  data() {
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=radius',
        encryptedFields: ['RADIUS_SECRET'],
        fields: [
          [this.$t('Basic'), ['AUTH_RADIUS', 'RADIUS_SERVER', 'RADIUS_PORT', 'RADIUS_SECRET']],
          [this.$t('MFA'), ['OTP_IN_RADIUS']],
          [this.$t('Other'), ['RADIUS_ORG_IDS']]
        ],
        fieldsMeta: {
          RADIUS_SECRET: {
            component: UpdateToken
          },
          RADIUS_ORG_IDS: {
            component: Select2,
            el: {
              popperClass: 'sync-setting-org',
              multiple: true,
              ajax: {
                url: '/api/v1/orgs/orgs/',
                transformOption: (item) => {
                  return { label: item.name, value: item.id }
                }
              }
            },
            hidden: () => {
              return !this.$hasLicense()
            }
          }
        },
        submitMethod: () => 'patch'
      }
    }
  },
  methods: {
    onConfirm() {
    }
  }
}
</script>

<style scoped>

</style>
