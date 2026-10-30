<template>
  <IBox :title="$t('MCPConnectionGuide')" class="mcp-connection-guide">
    <p class="guide-description">{{ $t('MCPUserConnectionHelp') }}</p>
    <el-alert
      v-if="!canConnect"
      :title="$t('MCPUserUnavailable')"
      type="info"
      :closable="false"
      show-icon
      class="guide-status"
    />
    <el-alert
      v-else-if="!settings.MCP_DCR_ENABLED"
      :title="$t('MCPUserRegistrationRequired')"
      type="warning"
      :closable="false"
      show-icon
      class="guide-status"
    />
    <div v-if="publicURL" class="connection-url">
      <span>{{ $t('MCPPublicURL') }}</span>
      <code>{{ publicURL }}</code>
      <el-button :disabled="!canConnect" @click="copy(publicURL)">
        {{ $t('Copy') }}
      </el-button>
    </div>
    <h5 class="client-title">Codex</h5>
    <div v-if="publicURL" class="connection-config">
      <div class="config-toolbar">
        <span>{{ $t('MCPConnectionConfig') }}</span>
        <el-button :disabled="!canConnect" @click="copy(codexCommands)">
          {{ $t('Copy') }}
        </el-button>
      </div>
      <pre><code>{{ codexCommands }}</code></pre>
    </div>
    <ol class="connection-steps">
      <li>{{ $t('MCPRunCLICommands') }}</li>
      <li>{{ $t('MCPBrowserAuthorization') }}</li>
      <li>{{ $t('MCPCodexCheckConnection') }}</li>
    </ol>
    <el-link
      href="https://learn.chatgpt.com/docs/extend/mcp"
      target="_blank"
      rel="noopener noreferrer"
      type="primary"
    >
      {{ $t('Documentation') }}
    </el-link>
    <div class="connection-verification">
      <h5>{{ $t('MCPVerifyConnection') }}</h5>
      <p>{{ $t('MCPConnectionVerificationHelp') }}</p>
      <p>{{ $t('MCPConnectionAuthorizationHelp') }}</p>
    </div>
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import { copy } from '@/utils/common/index'

export default {
  name: 'MCPConnectionGuide',
  components: { IBox },
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  computed: {
    publicURL() {
      return this.settings.MCP_PUBLIC_URL || ''
    },
    canConnect() {
      return Boolean(this.settings.MCP_ENABLED && this.publicURL)
    },
    codexCommands() {
      const quotedURL = "'" + this.publicURL.replaceAll("'", "'\"'\"'") + "'"
      return [
        'codex mcp add jumpserver --url ' + quotedURL,
        'codex mcp login jumpserver --scopes agent:access',
        'codex mcp list'
      ].join('\n')
    }
  },
  methods: { copy }
}
</script>

<style scoped>
.mcp-connection-guide {
  margin-bottom: 20px;
}

.guide-description {
  margin: 0 0 16px;
  color: var(--el-text-color-secondary);
}

.guide-status {
  margin-bottom: 16px;
}

.client-title {
  margin: 0 0 12px;
}

.connection-url {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.connection-url code {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.connection-config {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-fill-color-light);
}

.config-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.connection-config pre {
  margin: 0;
  padding: 12px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.connection-steps {
  padding-left: 20px;
  line-height: 1.8;
}

.connection-verification {
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color);
  padding-top: 16px;
  line-height: 1.8;
}

.connection-verification h5 {
  margin: 0 0 8px;
}

.connection-verification p {
  margin: 0 0 8px;
}
</style>
