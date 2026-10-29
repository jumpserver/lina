<template>
  <IBox :title="$t('AgentMCP')">
    <GenericCreateUpdateForm v-bind="config" />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  name: 'MCP',
  components: { IBox, GenericCreateUpdateForm },
  data() {
    return {
      config: {
        url: '/api/v1/settings/setting/?category=mcp',
        fields: ['MCP_ENABLED', 'MCP_PUBLIC_URL', 'MCP_DCR_ENABLED'],
        fieldsMeta: {
          MCP_ENABLED: {
            label: this.$t('MCPEnabled'),
            helpText: this.$t('MCPEnabledHelp'),
            helpTextAsTip: false
          },
          MCP_DCR_ENABLED: {
            label: this.$t('MCPAllowRegistration'),
            helpText: this.$t('MCPRegistrationHelp'),
            helpTextAsTip: false
          },
          MCP_PUBLIC_URL: {
            label: this.$t('MCPPublicURL'),
            helpText: this.$t('MCPPublicURLHelp'),
            helpTextAsTip: false
          }
        },
        hasReset: false,
        hasDetailInMsg: false,
        submitBtnText: this.$t('Save'),
        submitMethod: 'patch',
        updateSuccessNextRoute: { name: 'Feature', query: { tab: 'MCP' } }
      }
    }
  }
}
</script>
