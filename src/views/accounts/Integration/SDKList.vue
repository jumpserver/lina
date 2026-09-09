<template>
  <div class="integration-guide">
    <TwoCol :left="17" :right="7">
      <IBox :title="$t('GeneralGuide')">
        <el-tabs v-model="activeMode">
          <el-tab-pane :label="$t('PythonSDK')" name="sdk">
            <p class="guide-description">{{ $t('SDKDescription') }}</p>
          </el-tab-pane>

          <el-tab-pane :label="$t('AgentAccess')" name="agent">
            <p class="guide-description">{{ $t('AgentDescription') }}</p>
          </el-tab-pane>
        </el-tabs>
        <el-steps :active="-1" direction="vertical">
          <el-step :title="$t('AccessGuidePrepare')" :description="$t('AccessGuidePrepareHelp')" />
          <el-step
            :title="$t('AccessGuideAuthorize')"
            :description="$t('AccessGuideAuthorizeHelp')"
          />
          <el-step
            :title="$t('AccessGuideConfigure')"
            :description="$t('AccessGuideConfigureHelp')"
          />
          <el-step
            :title="$t('AccessGuideDeploy')"
            :description="
              $t(activeMode === 'sdk' ? 'AccessGuideSDKDeployHelp' : 'AccessGuideAgentDeployHelp')
            "
          />
          <el-step
            :title="$t('AccessGuideVerify')"
            :description="
              $t(activeMode === 'sdk' ? 'AccessGuideSDKVerifyHelp' : 'AccessGuideAgentVerifyHelp')
            "
          />
        </el-steps>
        <h4 v-if="activeMode === 'sdk'">{{ $t('InstallCommand') }}</h4>
        <p v-if="activeMode === 'sdk'">
          <code
            >python3 -m pip install --index-url https://pypi.org/simple "{{ sdkPackageUrl }}"</code
          >
        </p>
        <el-alert :title="$t('SDKInstallationNotice')" :closable="false" show-icon type="info" />
      </IBox>

      <template #right>
        <QuickActions :actions="guideActions" :title="$t('CurrentAction')" />
      </template>
    </TwoCol>
  </div>
</template>

<script>
import { IBox, QuickActions } from '@/components'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { BASE_URL } from '@/utils/common/index'

export default {
  name: 'SDKList',
  components: {
    IBox,
    QuickActions,
    TwoCol
  },
  data() {
    return {
      activeMode: 'sdk'
    }
  },
  computed: {
    sdkPackageUrl() {
      return `${BASE_URL}/api/v1/accounts/python-sdk/`
    },
    guideActions() {
      return [
        {
          title: this.$t('ApplicationCredentials'),
          attrs: {
            label: this.$t('ApplicationCredentials'),
            disabled: !this.$hasPerm('accounts.view_applicationcredential')
          },
          callbacks: { click: () => this.openTab('rotations') }
        },
        {
          title: this.$t('Applications'),
          attrs: { type: 'primary', label: this.$t('ViewApplications') },
          callbacks: { click: () => this.openTab('application') }
        }
      ]
    }
  },
  methods: {
    openTab(tab) {
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, tab }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.guide-description {
  margin: 8px 0 20px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.integration-guide :deep(.el-step__main) {
  min-width: 0;
  padding-bottom: 20px;
}

.integration-guide :deep(.el-step__title) {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.integration-guide :deep(.el-step__description) {
  padding-right: 0;
  color: var(--color-help-text);
  line-height: 22px;
}
</style>
