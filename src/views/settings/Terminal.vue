<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
      :has-detail-in-msg="false"
      :clean-form-value="cleanFormValue"
    />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
export default {
  name: 'Terminal',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      fields: [
        [
          'KoKo', [
            'TERMINAL_PASSWORD_AUTH', 'TERMINAL_PUBLIC_KEY_AUTH',
            'TERMINAL_ASSET_LIST_SORT_BY', 'TERMINAL_ASSET_LIST_PAGE_SIZE',
            'TERMINAL_TELNET_REGEX'
          ]
        ],
        [
          this.$t('common.Other'),
          [
            'TERMINAL_SESSION_KEEP_DURATION'
          ]
        ]
      ],
      fieldsMeta: {
        TERMINAL_TELNET_REGEX: {
          type: 'input'
        }
      },
      url: '/api/v1/settings/setting/?category=terminal'
    }
  },
  mounted() {
    if (this.$store.getters.hasValidLicense) {
      const xRDPFields = [
        'XRDP', [
          'TERMINAL_RDP_ADDR'
        ]
      ]
      this.fields.splice(1, 0, xRDPFields)
    }
  },
  methods: {
    getMethod() {
      return 'put'
    },
    cleanFormValue(data) {
      Object.keys(data).forEach(
        function(key) {
          if (data[key] === null) {
            delete data[key]
          }
        }
      )
      return data
    }
  }
}
</script>

<style scoped>

</style>
