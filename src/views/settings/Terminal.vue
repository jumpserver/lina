<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :initial="object"
      :update-success-next-route="successUrl"
      :clean-form-value="cleanFormValue"
      :object="object"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
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
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectFields: [
        [this.$t('setting.basicSetting'), ['TERMINAL_PASSWORD_AUTH', 'TERMINAL_PUBLIC_KEY_AUTH', 'TERMINAL_HEARTBEAT_INTERVAL',
          'TERMINAL_ASSET_LIST_SORT_BY', 'TERMINAL_ASSET_LIST_PAGE_SIZE', 'TERMINAL_SESSION_KEEP_DURATION',
          'TERMINAL_TELNET_REGEX']]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'Terminal' }},
      fieldsMeta: {
        TERMINAL_PASSWORD_AUTH: {
          label: this.$t('setting.terminalPasswordAuth'),
          type: 'checkbox'
        },
        TERMINAL_PUBLIC_KEY_AUTH: {
          label: this.$t('setting.terminalPublicKeyAuth'),
          type: 'checkbox'
        },
        TERMINAL_HEARTBEAT_INTERVAL: {
          label: this.$t('setting.terminalHeartbeatInterval'),
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.terminalHeartbeatInterval')
        },
        TERMINAL_ASSET_LIST_SORT_BY: {
          label: this.$t('setting.terminalAssetListSortBy'),
          type: 'select',
          options: [
            { label: this.$t('setting.Hostname'),
              value: 'hostname'
            },
            {
              label: 'IP',
              value: 'ip'
            }
          ],
          rules: [
            { required: true }
          ]
        },
        TERMINAL_ASSET_LIST_PAGE_SIZE: {
          label: this.$t('setting.terminalAssetListPageSize'),
          type: 'select',
          options: [
            { label: this.$t('setting.all'), value: 'all' },
            { label: this.$t('setting.auto'), value: 'auto' },
            { label: '10', value: '10' },
            { label: '15', value: '15' },
            { label: '25', value: '25' },
            { label: '50', value: '50' }
          ],
          rules: [
            { required: true }
          ]
        },
        TERMINAL_SESSION_KEEP_DURATION: {
          label: this.$t('setting.terminalSessionKeepDuration'),
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.terminalSessionKeepDuration')
        },
        TERMINAL_TELNET_REGEX: {
          label: this.$t('setting.terminalTelnetRegex'),
          helpText: this.$t('setting.helpText.terminalTelnetRegex')
        }
      },
      url: '/api/v1/settings/setting/'
    }
  },
  methods: {
    cleanFormValue(data) {
      return {
        terminal: data
      }
    },
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
