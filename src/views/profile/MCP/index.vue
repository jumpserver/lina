<template>
  <TabPage
    v-model:active-menu="activeMenu"
    :title="$t('AgentMCP')"
    :submenu="submenu"
    :help-message="activeMenu === 'MyMCPClients' ? $t('MCPUserClientHelp') : ''"
  >
    <template v-if="activeMenu === 'MyMCPClients'">
      <el-alert
        v-if="!settings.MCP_ENABLED"
        :title="$t('MCPUserUnavailable')"
        type="info"
        :closable="false"
        show-icon
        class="mcp-status"
      />
      <MCPUserClients allow-revoke />
    </template>
    <MCPConnectionGuide v-else :settings="settings" />
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import MCPConnectionGuide from '@/components/Apps/MCPConnectionGuide'
import MCPUserClients from '@/components/Apps/MCPUserClients'

export default {
  components: { TabPage, MCPConnectionGuide, MCPUserClients },
  data() {
    return { activeMenu: 'MyMCPClients' }
  },
  computed: {
    settings() {
      return this.$store.getters.publicSettings
    },
    submenu() {
      return [
        { name: 'MyMCPClients', title: this.$t('MyMCPClients') },
        { name: 'MCPDocumentation', title: this.$t('MCPAccessDocumentation') }
      ]
    }
  }
}
</script>

<style scoped>
.mcp-status {
  margin-bottom: 20px;
}
</style>
