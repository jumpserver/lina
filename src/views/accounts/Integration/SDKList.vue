<template>
  <div class="integration-guide">
    <TwoCol :left="17" :right="7">
      <IBox :title="$t('GeneralGuide')">
        <el-tabs v-model="activeMode">
          <el-tab-pane :label="$t('PythonSDK')" name="sdk">
            <p class="guide-description">{{ $t('SDKDescription') }}</p>
            <el-steps :active="3" direction="vertical" finish-status="success">
              <el-step
                :description="$t('SelectApplicationHelp')"
                :title="$t('SelectApplication')"
              />
              <el-step
                :description="$t('CopyConnectionParametersHelp')"
                :title="$t('ConnectionParameters')"
              />
              <el-step :description="$t('SDKDescription')" :title="$t('PythonSDK')" />
            </el-steps>
          </el-tab-pane>

          <el-tab-pane :label="$t('AgentAccess')" name="agent">
            <p class="guide-description">{{ $t('AgentDescription') }}</p>
            <el-steps :active="3" direction="vertical" finish-status="success">
              <el-step
                :description="$t('SelectApplicationHelp')"
                :title="$t('SelectApplication')"
              />
              <el-step :description="$t('CopyInstallCommandHelp')" :title="$t('InstallCommand')" />
              <el-step :description="$t('WaitAgentOnlineHelp')" :title="$t('ClientStatus')" />
            </el-steps>
          </el-tab-pane>
        </el-tabs>
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
    guideActions() {
      return [
        {
          title: this.$t('Applications'),
          attrs: { type: 'primary', label: this.$t('ViewApplications') },
          callbacks: { click: this.openApplications }
        }
      ]
    }
  },
  methods: {
    openApplications() {
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, tab: 'application' }
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
