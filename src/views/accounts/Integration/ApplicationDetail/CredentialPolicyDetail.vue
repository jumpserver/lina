<template>
  <TabPage
    v-model:active-menu="activeTab"
    :submenu="submenu"
    class="credential-policy-detail drawer"
    navigation-scope="local"
    title="null"
  >
    <div v-if="activeTab === 'basic'" class="credential-policy-basic">
      <IBox>
        <AutoDetailCard :fields="detailFields" :object="policy" :url="detailUrl" />
      </IBox>

      <IBox>
        <div class="access-header">
          <div class="access-title">{{ $t('ApplicationCredentialAccess') }}</div>
          <div class="access-actions">
            <el-button
              :disabled="!canViewSecret"
              :loading="secretLoading"
              plain
              size="small"
              @click="loadSecret"
            >
              {{ $t('GetApplicationSecret') }}
            </el-button>
            <el-button plain size="small" @click="copy(accessParameters)">
              <el-icon><CopyDocument /></el-icon>
              {{ $t('CopyAccessParameters') }}
            </el-button>
          </div>
        </div>
        <el-alert
          :closable="false"
          :description="accessHelp"
          :title="$t('CredentialAccessHint')"
          show-icon
          type="info"
        />
        <div class="access-template">
          <div class="access-template__header">
            <span>{{ $t('SDKAgentAccessParameters') }}</span>
          </div>
          <el-input
            :autosize="{ minRows: 9, maxRows: 12 }"
            :model-value="accessParameters"
            class="access-template__input"
            readonly
            type="textarea"
          />
        </div>
      </IBox>
    </div>

    <CredentialLeases v-else-if="activeTab === 'temporaryCredentials'" :policy-id="policyId" />
  </TabPage>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import IBox from '@/components/Common/IBox/index.vue'
import { TabPage } from '@/layout/components'
import { BASE_API } from '@/utils/env'
import CredentialLeases from './CredentialLeases.vue'

export default {
  name: 'CredentialPolicyDetail',
  components: { AutoDetailCard, CredentialLeases, IBox, TabPage },
  props: {
    application: {
      type: Object,
      required: true
    },
    drawerContext: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activeTab: 'basic',
      applicationSecret: '',
      secretLoading: false
    }
  },
  computed: {
    policy() {
      return this.drawerContext?.row || {}
    },
    policyId() {
      return this.drawerContext?.id || this.policy.id || ''
    },
    mode() {
      return this.policy.mode?.value || this.policy.mode
    },
    showTemporaryCredentials() {
      return (
        this.mode === 'dynamic' &&
        Boolean(this.policyId) &&
        this.$hasPerm('accounts.view_credentiallease')
      )
    },
    submenu() {
      const items = [{ title: this.$t('Basic'), name: 'basic' }]
      if (this.showTemporaryCredentials) {
        items.push({ title: this.$t('TemporaryCredentials'), name: 'temporaryCredentials' })
      }
      return items
    },
    detailUrl() {
      return `/api/v1/accounts/credential-policies/${this.policyId}/`
    },
    endpoint() {
      const action = this.mode === 'dynamic' ? 'credentials/' : 'credential/'
      return `/api/v1/accounts/credential-service/policies/${this.policyId}/${action}`
    },
    serviceUrl() {
      return new URL(BASE_API || '/', window.location.origin).toString().replace(/\/$/, '')
    },
    fullEndpoint() {
      return `${this.serviceUrl}${this.endpoint}`
    },
    organizationId() {
      return this.$route.query.oid || this.$store.getters.currentOrg?.id || ''
    },
    canViewSecret() {
      return this.application.is_active && this.$hasPerm('accounts.change_integrationapplication')
    },
    accessParameters() {
      return [
        `JMS_URL='${this.serviceUrl}'`,
        `JMS_APP_ID='${this.application.id || '<application_id>'}'`,
        `JMS_APP_SECRET='${this.applicationSecret || '<application_secret>'}'`,
        `JMS_ORG_ID='${this.organizationId || '<organization_id>'}'`,
        `POLICY_ID='${this.policyId || '<policy_id>'}'`,
        `CREDENTIAL_METHOD='${this.mode === 'dynamic' ? 'POST' : 'GET'}'`,
        `CREDENTIAL_ENDPOINT='${this.fullEndpoint}'`,
        "JMS_SOURCE='jms-pam'",
        "JMS_TIMEOUT='35'"
      ].join('\n')
    },
    accessHelp() {
      return this.$t(
        this.mode === 'dynamic' ? 'TemporaryCredentialAccessHelp' : 'RotatingCredentialAccessHelp'
      )
    },
    detailFields() {
      const common = ['name', 'mode', 'status', 'asset', 'management_account']
      const modeFields =
        this.mode === 'dynamic'
          ? ['account_template', 'username_template', 'default_ttl', 'max_ttl', 'max_active_leases']
          : [
              'account',
              'rotation_period',
              'current_version',
              'date_last_rotated',
              'next_rotation_at'
            ]
      return [
        ...common,
        ...modeFields,
        'last_execution',
        'last_error',
        'created_by',
        'date_created',
        'date_updated',
        'comment'
      ]
    }
  },
  methods: {
    async loadSecret() {
      this.secretLoading = true
      try {
        const { secret } = await this.$axios.get(
          `/api/v1/accounts/integration-applications/${this.application.id}/secret/`
        )
        this.applicationSecret = secret
      } finally {
        this.secretLoading = false
      }
    },
    async copy(value) {
      try {
        await navigator.clipboard.writeText(value)
        this.$message.success(this.$t('CopySuccess'))
      } catch {
        this.$message.error(this.$t('CopyFailed'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.access-header,
.access-actions {
  display: flex;
  align-items: center;
}

.access-header {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.access-actions {
  gap: 8px;
}

.access-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.access-title {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
}

.credential-policy-basic {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.access-template {
  margin-top: 20px;
}

.access-template__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.access-template__input :deep(textarea) {
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .access-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .access-actions,
  .access-template__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
