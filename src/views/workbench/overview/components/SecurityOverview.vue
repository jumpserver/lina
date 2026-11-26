<template>
  <HomeCard :title="$t('OverviewAccountSecurity')" class="security-overview">
    <template #header-action>
      <div class="refresh-action">
        <small v-if="status" role="status">{{ $t(status) }}</small>
        <el-tooltip
          :disabled="!pageActive"
          :content="refreshLabel"
          :trigger="['hover', 'focus']"
          placement="top"
        >
          <el-button
            link
            :loading="loading"
            :disabled="loading"
            :aria-label="refreshLabel"
            @click="$emit('refresh')"
          >
            <svg-icon v-if="!loading" icon-class="refresh" />
          </el-button>
        </el-tooltip>
      </div>
    </template>
    <div :aria-busy="loading">
      <el-alert v-if="risk" class="risk-alert" type="warning" show-icon :closable="false">
        <template #title>
          <span>{{ risk }}</span>
          <router-link v-if="accessKey.canManage" :to="accessKey.route">
            {{ $t('View') }}
          </router-link>
        </template>
      </el-alert>
      <dl class="session-summary">
        <div>
          <dt>{{ $t('OverviewAccountSessions') }}</dt>
          <dd>
            <strong>{{ loginSessions?.count ?? '—' }}</strong>
            <small>{{ loginDetail }}</small>
          </dd>
        </div>
        <div>
          <dt>{{ $t('OverviewOnlineAssetSessions') }}</dt>
          <dd>
            <strong>{{ overview?.asset_sessions?.count ?? '—' }}</strong>
            <small>{{ orgScope }}</small>
          </dd>
        </div>
      </dl>
      <h3 class="credentials-title">{{ $t('OverviewPlatformCredentials') }}</h3>
      <ul class="credential-list">
        <li v-for="row in credentialRows" :key="row.key">
          <el-tooltip
            :disabled="!pageActive"
            :show-after="400"
            :trigger="['hover', 'focus']"
            placement="top"
          >
            <template #content>
              {{ $t(row.rule) }}
              <template v-if="row.detail"><br />{{ row.detail }}</template>
            </template>
            <component
              :is="row.canManage ? 'router-link' : 'span'"
              class="credential-row"
              :to="row.canManage ? row.route : undefined"
              :tabindex="row.canManage ? undefined : 0"
              :aria-disabled="row.canManage ? undefined : true"
            >
              <svg-icon class="credential-icon" :icon-class="row.icon" aria-hidden="true" />
              <span class="credential-label">
                {{ $t(row.label) }}
                <small v-if="row.orgScoped">{{ orgScope }}</small>
                <small v-if="row.state">{{ $t(row.state) }}</small>
              </span>
              <strong class="credential-count" :class="{ muted: !row.count }">
                {{ row.count ?? '—' }}
              </strong>
              <el-icon v-if="row.canManage" class="row-arrow" aria-hidden="true"
                ><ArrowRight
              /></el-icon>
            </component>
          </el-tooltip>
        </li>
      </ul>
    </div>
  </HomeCard>
</template>

<script>
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import HomeCard from './HomeCard.vue'

const credentials = [
  {
    key: 'access_keys',
    label: 'AccessKey',
    icon: 'key',
    rule: 'OverviewActiveAccessKeys',
    route: { name: 'AccessKey' },
    permission: 'authentication.view_accesskey'
  },
  {
    key: 'temp_tokens',
    label: 'OverviewTemporaryPassword',
    icon: 'password',
    rule: 'OverviewValidTempPasswords',
    route: { name: 'TempToken' },
    permission: 'authentication.view_temptoken',
    setting: 'AUTH_TEMP_TOKEN'
  },
  {
    key: 'connection_tokens',
    label: 'OverviewReusableConnectionToken',
    icon: 'connect',
    rule: 'OverviewConnectionTokenRule',
    route: { name: 'ConnectionToken' },
    permission: 'authentication.view_connectiontoken',
    orgScoped: true
  },
  {
    key: 'ssh_keys',
    label: 'OverviewSSHKey',
    icon: 'terminal',
    rule: 'OverviewActiveSSHKeys',
    route: { name: 'SSHKeyList', query: { tab: 'SSHKeyList' } },
    permission: 'authentication.view_sshkey'
  },
  {
    key: 'passkeys',
    label: 'Passkey',
    icon: 'passkey',
    rule: 'OverviewActivePasskeys',
    route: { name: 'Passkey' },
    permission: 'authentication.view_passkey',
    setting: 'AUTH_PASSKEY'
  },
  {
    key: 'access_tokens',
    label: 'OverviewOAuth2Token',
    icon: 'access-token',
    rule: 'OverviewValidAccessTokens',
    route: { name: 'AccessToken' },
    permission: 'oauth2_provider.view_accesstoken'
  }
]

export default {
  name: 'SecurityOverview',
  components: { HomeCard },
  props: {
    summary: { type: Object, default: null },
    loading: Boolean,
    error: Boolean,
    denied: Boolean,
    allOrgs: Boolean
  },
  emits: ['refresh'],
  data() {
    return { pageActive: true }
  },
  activated() {
    this.pageActive = true
  },
  deactivated() {
    this.pageActive = false
  },
  computed: {
    overview() {
      return this.error || this.denied ? null : this.summary
    },
    orgScope() {
      return this.$t(this.allOrgs ? 'OverviewAccessibleOrgs' : 'OverviewCurrentOrg')
    },
    refreshLabel() {
      if (this.loading) return this.$t('Loading')
      return this.$t(this.error || this.denied ? 'Retry' : 'Refresh')
    },
    status() {
      if (this.denied) return 'NoPermission'
      if (this.error) return 'LoadFailed'
      if (!this.overview && this.loading) return 'Loading'
      const keys = this.overview?.access_keys
      if (
        !Number.isInteger(this.overview?.asset_sessions?.count) ||
        !Number.isInteger(this.loginSessions?.count) ||
        !Number.isInteger(this.loginSessions?.current) ||
        !Number.isInteger(this.loginSessions?.other) ||
        !Number.isInteger(keys?.unused_count) ||
        !Number.isInteger(keys?.unused_days) ||
        this.credentialRows.some((row) => row.missing)
      ) {
        return 'OverviewDataUnavailable'
      }
      return ''
    },
    loginSessions() {
      return this.overview?.login_sessions
    },
    loginDetail() {
      return this.$t('OverviewLoginBreakdown', {
        current: this.loginSessions?.current ?? '—',
        other: this.loginSessions?.other ?? '—'
      })
    },
    accessKey() {
      return this.credentialRows.find((row) => row.key === 'access_keys')
    },
    risk() {
      const keys = this.overview?.access_keys
      if (!(keys?.unused_count > 0 && keys.unused_days > 0)) return ''
      return this.$t('OverviewUnusedKeyWarning', {
        count: keys.unused_count,
        days: keys.unused_days
      })
    },
    credentialRows() {
      const settings = this.$store.getters.publicSettings
      return credentials.map((type) => {
        const item = this.overview?.[type.key]
        const count = Number.isInteger(item?.count) ? item.count : null
        const enabled = type.setting ? (item?.enabled ?? settings?.[type.setting]) : true
        const missing = count === null || typeof enabled !== 'boolean'
        const hasPermission = this.$hasPerm(type.permission)
        const hasRoute = this.$router.hasRoute(type.route.name)
        const reuseDisabled =
          type.key === 'connection_tokens' && settings?.CONNECTION_TOKEN_REUSABLE === false
        let state = ''
        if (this.overview) {
          if (enabled === false) state = 'MFAFeatureDisabled'
          else if (!hasPermission) state = 'NoPermission'
          else if (!hasRoute || missing) state = 'OverviewDataUnavailable'
          else if (reuseDisabled) state = 'OverviewReuseDisabled'
        }
        let detail = ''
        if (type.key === 'temp_tokens' && item?.next_expiry) {
          detail = this.$t('OverviewNextExpiry', { time: toSafeLocalDateStr(item.next_expiry) })
        }
        if (reuseDisabled) detail = this.$t('OverviewReuseDisabledDetail')
        if (type.key === 'access_keys' && item?.unused_days) {
          detail = this.$t('OverviewUnusedKeyRule', { days: item.unused_days })
        }
        return {
          ...type,
          count,
          state,
          detail,
          missing,
          canManage: Boolean(this.overview) && enabled === true && hasPermission && hasRoute
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.security-overview :deep(.el-card__header) {
  display: block;
}
.refresh-action {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);

  .el-button {
    width: 24px;
    height: 24px;
    padding: 0;
  }
}
.risk-alert {
  padding: 7px 10px;

  :deep(.el-alert__content) {
    flex: 1;
    min-width: 0;
  }
  :deep(.el-alert__title) {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    font-weight: normal;
    overflow-wrap: anywhere;
    color: var(--el-color-warning-dark-2);
  }
  a {
    flex-shrink: 0;
    color: var(--color-link);
  }
}
.risk-alert + .session-summary {
  margin-top: 8px;
}
.session-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: auto auto;
  grid-auto-flow: column;
  gap: 4px 12px;
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--el-border-radius-small);
  background: var(--el-fill-color-lighter);
  overflow-wrap: anywhere;

  > div {
    display: contents;
  }
  dt,
  small {
    color: var(--color-text-secondary);
  }
  dd {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
  }
  strong {
    font-size: 24px;
    line-height: 1.2;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
}
.security-overview small {
  font-size: var(--el-font-size-extra-small);
}
.credentials-title {
  margin: 14px 0 3px;
  font-size: var(--el-font-size-base);
  font-weight: 500;
}
.credential-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.credential-row {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto 12px;
  align-items: center;
  column-gap: 8px;
  min-height: 34px;
  padding: 2px 4px;
  border-radius: var(--el-border-radius-small);
  color: var(--color-text-primary);
}
.credential-row:focus-visible,
.risk-alert a:focus-visible,
.refresh-action button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}
a.credential-row:hover,
a.credential-row:focus-visible {
  background: var(--el-fill-color-lighter);
  color: var(--color-link);
}
.credential-label {
  overflow-wrap: anywhere;

  small {
    margin-inline-start: 4px;
    color: var(--color-text-secondary);
  }
}
.credential-icon {
  font-size: 16px;
  color: var(--color-icon-primary);
}
.credential-count {
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.row-arrow,
.muted {
  color: var(--color-text-secondary);
}
.row-arrow {
  font-size: var(--el-font-size-extra-small);
}
</style>
