<template>
  <div>
    <IBox :title="$t('AgentMCP')" class="mcp-settings">
      <GenericCreateUpdateForm v-bind="config" />
    </IBox>
    <MCPClients v-if="$hasPerm('settings.change_auth')" />
  </div>
</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import MCPClients from './MCPClients.vue'

export default {
  name: 'MCP',
  components: { IBox, GenericCreateUpdateForm, MCPClients },
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
        updateSuccessNextRoute: { name: 'ChatAISettings', query: { tab: 'MCP' } }
      }
    }
  }
}
</script>

<style scoped>
.mcp-settings {
  margin-bottom: 20px;
}
</style>
