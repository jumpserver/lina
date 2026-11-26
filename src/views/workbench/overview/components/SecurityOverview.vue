<template>
  <el-card class="security-card box-card no-border" shadow="never" v-loading="loading">
    <template #header>
      <div class="heading">
        <span>{{ $t('OverviewSecurityTitle') }}</span>
        <el-button link :disabled="loading" @click="loadSummary">{{ $t('Refresh') }}</el-button>
      </div>
    </template>
    <div v-if="error" class="error-state" role="alert">
      <span>{{ $t('OverviewLoadFailed') }}</span>
      <el-button type="primary" link @click="loadSummary">{{ $t('OverviewRetry') }}</el-button>
    </div>
    <template v-else-if="summary">
      <div v-if="summary.access_keys.unused_count" class="security-notice">
        <span>{{
          $t('OverviewUnusedKeys', {
            count: summary.access_keys.unused_count,
            days: summary.access_keys.unused_days
          })
        }}</span>
        <router-link v-if="can('authentication.view_accesskey')" :to="{ name: 'AccessKey' }">{{
          $t('OverviewView')
        }}</router-link>
      </div>
      <div v-for="row in primaryRows" :key="row.key" class="security-row">
        <div class="row-label">
          <span>{{ row.label }}</span
          ><small v-if="row.hint">{{ row.hint }}</small>
        </div>
        <span class="count">{{ $t('OverviewCount', { count: row.count }) }}</span>
        <router-link v-if="row.route && can(row.permission)" :to="row.route">{{
          $t('OverviewManage')
        }}</router-link>
        <span v-else class="action-placeholder" />
      </div>
      <button
        class="disclosure"
        type="button"
        :aria-expanded="expanded"
        aria-controls="overview-other-credentials"
        @click="expanded = !expanded"
      >
        <span>{{ $t('OverviewOtherCredentials') }}</span>
        <span class="disclosure-action"
          >{{ $t(expanded ? 'OverviewCollapse' : 'OverviewExpand')
          }}<el-icon><ArrowUp v-if="expanded" /><ArrowDown v-else /></el-icon
        ></span>
      </button>
      <div v-show="expanded" id="overview-other-credentials">
        <div v-for="row in secondaryRows" :key="row.key" class="security-row child-row">
          <span class="row-label">{{ row.label }}</span>
          <span class="count">{{ $t('OverviewCount', { count: row.count }) }}</span>
          <router-link v-if="can(row.permission)" :to="row.route">{{
            $t('OverviewManage')
          }}</router-link>
          <span v-else class="action-placeholder" />
        </div>
      </div>
      <div class="security-row mfa-row">
        <span>{{ $t('OverviewMFA') }}</span>
        <a
          :href="mfaUrl"
          target="_blank"
          rel="noopener noreferrer"
          :class="{ configured: summary.mfa.configured }"
        >
          <el-icon v-if="summary.mfa.configured"><CircleCheck /></el-icon>
          {{
            $t(
              summary.mfa.configured
                ? 'OverviewMFAEnabled'
                : summary.mfa.enabled
                  ? 'OverviewMFASetup'
                  : 'OverviewMFADisabled'
            )
          }}
        </a>
      </div>
    </template>
  </el-card>
</template>
<script>
import { addBasePath } from '@/utils/common/index'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
export default {
  name: 'SecurityOverview',
  data() {
    return {
      summary: null,
      loading: false,
      error: false,
      expanded: true,
      requestId: 0,
      expiryTimer: null
    }
  },
  computed: {
    orgId() {
      return this.$store.getters.currentOrg?.id
    },
    mfaUrl() {
      return addBasePath('/core/auth/profile/mfa/')
    },
    primaryRows() {
      if (!this.summary) return []
      const s = this.summary
      const rows = [
        {
          key: 'sessions',
          label: this.$t('OverviewAccountSessions'),
          count: s.login_sessions.count,
          hint: this.$t('OverviewSessionBreakdown', s.login_sessions)
        },
        {
          key: 'asset-sessions',
          label: this.$t('OverviewOnlineAssetSessions'),
          count: s.asset_sessions.count,
          hint: this.$t('OverviewOwnCurrentOrg')
        },
        {
          key: 'keys',
          label: this.$t('OverviewActiveAccessKeys'),
          count: s.access_keys.count,
          route: { name: 'AccessKey' },
          permission: 'authentication.view_accesskey'
        }
      ]
      if (s.temp_tokens.enabled) {
        rows.push({
          key: 'temp',
          label: this.$t('OverviewValidTempPasswords'),
          count: s.temp_tokens.count,
          hint: s.temp_tokens.next_expiry
            ? this.$t('OverviewNextExpiry', { time: toSafeLocalDateStr(s.temp_tokens.next_expiry) })
            : '',
          route: { name: 'TempToken' },
          permission: 'authentication.view_temptoken'
        })
      }
      rows.push({
        key: 'connections',
        label: this.$t('OverviewReusableTokens'),
        count: s.connection_tokens.count,
        hint: this.$t('OverviewCurrentOrg'),
        route: { name: 'ConnectionToken' },
        permission: 'authentication.view_connectiontoken'
      })
      return rows
    },
    secondaryRows() {
      if (!this.summary) return []
      const rows = [
        {
          key: 'ssh',
          label: this.$t('OverviewActiveSSHKeys'),
          count: this.summary.ssh_keys.count,
          route: { name: 'SSHKeyList', query: { tab: 'SSHKeyList' } },
          permission: 'authentication.view_sshkey'
        }
      ]
      if (this.summary.passkeys.enabled) {
        rows.push({
          key: 'passkeys',
          label: this.$t('OverviewActivePasskeys'),
          count: this.summary.passkeys.count,
          route: { name: 'Passkey' },
          permission: 'authentication.view_passkey'
        })
      }
      rows.push({
        key: 'access-tokens',
        label: this.$t('OverviewValidAccessTokens'),
        count: this.summary.access_tokens.count,
        route: { name: 'AccessToken' },
        permission: 'oauth2_provider.view_accesstoken'
      })
      return rows
    }
  },
  watch: {
    orgId() {
      this.loadSummary()
    }
  },
  mounted() {
    this.loadSummary()
    window.addEventListener('focus', this.onFocus)
  },
  beforeUnmount() {
    this.requestId++
    window.removeEventListener('focus', this.onFocus)
    window.clearTimeout(this.expiryTimer)
  },
  methods: {
    can(permission) {
      return !permission || this.$hasPerm(permission)
    },
    onFocus() {
      if (!this.loading) this.loadSummary()
    },
    async loadSummary() {
      const id = ++this.requestId
      this.loading = true
      this.error = false
      this.summary = null
      window.clearTimeout(this.expiryTimer)
      try {
        const data = await this.$axios.get('/api/v1/authentication/security-overview/', {
          disableFlashErrorMsg: true
        })
        if (id !== this.requestId) return
        this.summary = data
        if (data.temp_tokens.enabled && data.temp_tokens.next_expiry) {
          const delay = Date.parse(data.temp_tokens.next_expiry) - Date.parse(data.generated_at)
          if (delay > 0) {
            this.expiryTimer = window.setTimeout(
              () => this.loadSummary(),
              Math.min(delay + 1000, 2147483647)
            )
          }
        }
      } catch {
        if (id === this.requestId) this.error = true
      } finally {
        if (id === this.requestId) this.loading = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.security-card {
  margin-bottom: 20px;
}
.heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 500;
}
:deep(.el-card__body) {
  padding-top: 12px;
}
.security-row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 42px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
}
.row-label {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
small {
  display: block;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}
.count {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
a {
  color: var(--color-primary);
  white-space: nowrap;
}
.security-row > a,
.action-placeholder {
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
}
.security-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--el-color-warning-light-7);
  border-radius: 3px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  font-size: 13px;
  line-height: 1.5;
}
.disclosure {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  color: var(--el-text-color-primary);
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  text-align: left;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.disclosure-action {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  white-space: nowrap;
}
.disclosure:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
.child-row {
  padding-left: 24px;
}
.mfa-row {
  justify-content: space-between;
  border-bottom: 0;
}
.mfa-row a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.configured {
  color: var(--el-color-success);
}
.error-state {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--el-text-color-secondary);
}
</style>
