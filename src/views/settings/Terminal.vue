<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
      :has-detail-in-msg="false"
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
      selectFields: [
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
  methods: {
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
