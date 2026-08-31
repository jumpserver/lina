<template>
  <div>
    <TwoCol>
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
      <DetailCard :items="agentDetailItems" :title="$t('Agent')" class="agent-card" />
      <template #right>
        <QuickActions :actions="quickActions" type="primary" />
      </template>
    </TwoCol>
    <SecretDialog ref="secretDialog" />
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import DetailCard from '@/components/Cards/DetailCard/index.vue'
import SecretDialog from '@/components/Dialog/Secret.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { h, resolveComponent } from 'vue'

const AGENT_STATUS_TYPE_MAP = {
  online: 'success',
  offline: 'warning',
  error: 'danger',
  unregistered: 'info'
}

export default {
  name: 'IntegrationApplicationInfo',
  components: {
    TwoCol,
    SecretDialog,
    AutoDetailCard,
    QuickActions,
    DetailCard
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      warningText: this.$t('ApiKeyWarning'),
      key: { id: '', secret: '' },
      quickActions: [
        {
          title: this.$t('Secret'),
          attrs: {
            type: 'primary',
            label: this.$t('Generate'),
            disabled:
              !this.$hasPerm('accounts.change_integrationapplication') || !this.object.is_active
          },
          callbacks: {
            click: function () {
              this.$axios
                .get(`/api/v1/accounts/integration-applications/${this.object.id}/secret/`)
                .then((res) => {
                  this.$refs.secretDialog.show(res)
                })
            }.bind(this)
          }
        },
        {
          title: this.$t('Agent'),
          attrs: {
            type: 'default',
            label: this.$t('ResetAgent'),
            disabled: !this.$hasPerm('accounts.change_integrationapplication')
          },
          callbacks: {
            click: () => this.resetAgent()
          }
        }
      ],
      url: `/api/v1/accounts/integration-applications/${this.object.id}`,
      detailFields: ['id', 'name', 'owner', 'date_created', 'date_updated', 'comment', 'is_active']
    }
  },
  computed: {
    agentDetailItems() {
      const agent = this.object.agent || {}
      const statusType = AGENT_STATUS_TYPE_MAP[agent.status?.value] || 'info'
      return [
        {
          key: this.$t('Status'),
          value: agent.status?.label || '-',
          formatter: (item, value) =>
            h(resolveComponent('el-tag'), { type: statusType }, () => value)
        },
        { key: this.$t('AgentID'), value: agent.id },
        { key: this.$t('Hostname'), value: agent.hostname },
        { key: this.$t('Platform'), value: agent.platform },
        { key: this.$t('Version'), value: agent.version },
        { key: this.$t('LastSeen'), value: toSafeLocalDateStr(agent.last_seen) },
        {
          key: this.$t('Error'),
          value: agent.error,
          has: Boolean(agent.error),
          formatter: (item, value) => h('span', { class: 'agent-error' }, value)
        }
      ]
    }
  },
  methods: {
    async resetAgent() {
      await this.$confirm(this.$t('ResetAgentConfirm'))
      await this.$axios.post(
        `/api/v1/accounts/integration-applications/${this.object.id}/reset-agent/`
      )
      this.$message.success(this.$t('ResetAgentSuccess'))
      this.$router.go(0)
    }
  }
}
</script>

<style lang="scss" scoped>
.agent-card {
  margin-top: 8px;
}

:deep(.agent-error) {
  color: var(--el-color-danger);
}
</style>
