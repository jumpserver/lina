<template>
  <div>
    <IBox :title="$t('AgentMCP')" class="mcp-settings">
      <GenericCreateUpdateForm v-bind="config" ref="form" />
    </IBox>
  </div>
</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import { Required } from '@/components/Form/DataForm/rules'

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
            helpTextAsTip: false,
            on: {
              change: ([enabled]) => this.setMCPURLRequired(enabled)
            }
          },
          MCP_DCR_ENABLED: {
            label: this.$t('MCPAllowRegistration'),
            helpText: this.$t('MCPRegistrationHelp'),
            helpTextAsTip: false
          },
          MCP_PUBLIC_URL: {
            label: this.$t('MCPPublicURL'),
            helpText: this.$t('MCPPublicURLHelp'),
            helpTextAsTip: false,
            rules: [{ ...Required, required: false }]
          }
        },
        afterGetFormValue: (form) => {
          this.setMCPURLRequired(form.MCP_ENABLED)
          return form
        },
        hasReset: false,
        hasDetailInMsg: false,
        submitBtnText: this.$t('Save'),
        submitMethod: 'patch',
        updateSuccessNextRoute: { name: 'ChatAISettings', query: { tab: 'MCP' } }
      }
    }
  },
  methods: {
    setMCPURLRequired(enabled) {
      this.config.fieldsMeta.MCP_PUBLIC_URL.rules[0].required = !!enabled
      this.$nextTick(() => this.$refs.form?.validateField('MCP_PUBLIC_URL', () => {}))
    }
  }
}
</script>

<style scoped>
.mcp-settings {
  margin-bottom: 20px;
}
</style>
