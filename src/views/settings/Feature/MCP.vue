<template>
  <div>
    <IBox :title="$t('AgentMCP')" class="mcp-settings">
      <GenericCreateUpdateForm
        v-bind="config"
        @get-object-done="updateSavedSettings"
        @submit-success="updateSavedSettings"
      />
    </IBox>
    <MCPConnectionGuide
      v-if="savedSettings"
      :settings="savedSettings"
      :description="$t('MCPSavedConnectionHelp')"
      :unavailable-text="$t('MCPSaveBeforeConnect')"
      :registration-required-text="$t('MCPRegistrationRequired')"
    />
    <MCPClients v-if="$hasPerm('settings.change_auth')" />
  </div>
</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import MCPClients from './MCPClients.vue'
import MCPConnectionGuide from '@/components/Apps/MCPConnectionGuide'

export default {
  name: 'MCP',
  components: { IBox, GenericCreateUpdateForm, MCPClients, MCPConnectionGuide },
  data() {
    return {
      savedSettings: null,
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
  },
  methods: {
    updateSavedSettings(settings) {
      this.savedSettings = { ...this.savedSettings, ...settings }
    }
  }
}
</script>

<style scoped>
.mcp-settings {
  margin-bottom: 20px;
}
</style>
