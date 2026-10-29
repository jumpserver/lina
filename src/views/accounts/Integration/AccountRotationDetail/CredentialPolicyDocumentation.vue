<template>
  <IBox :title="$t('PolicyDocsTitle')" class="policy-documentation">
    <template #header>
      <div class="policy-documentation-toolbar">
        <h5>{{ $t('PolicyDocsTitle') }}</h5>
        <el-button :loading="exportLoading" @click="exportPdf">
          {{ $t('ExportAsPDF') }}
        </el-button>
      </div>
    </template>
    <article ref="document" class="policy-documentation-body">
      <header class="policy-documentation-introduction">
        <div class="policy-documentation-meta">
          <el-tag effect="plain">{{ modeLabel }}</el-tag>
          <span>{{ $t('CredentialKey') }}</span>
          <code>{{ object.key }}</code>
        </div>
        <p>{{ $t('PolicyDocsIntroduction') }}</p>
        <el-alert :title="modeSummary" type="info" :closable="false" show-icon />
      </header>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('CurrentAccount')">
          {{ object.active_account?.username || object.active_account?.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('PolicyDocsObservationWindow')">
          {{ $t('PolicyDocsObservationDays', { days: object.source_no_traffic_days ?? 7 }) }}
        </el-descriptions-item>
      </el-descriptions>
      <nav class="policy-documentation-links" :aria-label="$t('IntegrationDocsLinks')">
        <span>{{ $t('IntegrationDocsLinks') }}</span>
        <router-link v-for="link in documentationLinks" :key="link.label" :to="link.to">
          {{ $t(link.label) }}
        </router-link>
      </nav>
      <nav class="policy-documentation-nav" :aria-label="$t('OnThisPage')">
        <span>{{ $t('OnThisPage') }}</span>
        <button
          v-for="section in documentationSections"
          :key="section.id"
          type="button"
          @click="scrollToSection(section.id)"
        >
          {{ $t(section.title) }}
        </button>
      </nav>
      <section
        v-for="section in documentationSections"
        :key="section.id"
        :data-section="section.id"
        :aria-label="$t(section.title)"
        class="policy-documentation-section"
        tabindex="-1"
      >
        <h2>{{ $t(section.title) }}</h2>
        <MarkdownRenderer
          :source="section.content"
          copyable-code
          class="policy-documentation-content"
        />
      </section>
    </article>
  </IBox>
</template>

<script>
import MarkdownRenderer from '@/components/Widgets/MarkdownRenderer/index.vue'
import IBox from '@/components/Common/IBox/index.vue'
import { printDocumentation } from '../documentationPrint'

export default {
  name: 'CredentialPolicyDocumentation',
  components: { IBox, MarkdownRenderer },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return { exportLoading: false }
  },
  computed: {
    modeLabel() {
      return this.$t('AlternatingAccountRotation')
    },
    modeSummary() {
      return this.$t(
        this.object.verify_before_switch === false
          ? 'PolicyDocsRotationSummaryWithoutVerification'
          : 'PolicyDocsRotationSummaryV2'
      )
    },
    documentationLinks() {
      return [
        ['overview', 'IntegrationDocsOverview'],
        ['agent', 'AgentAccess'],
        ['sdk', 'SDKAccess'],
        ['protocol', 'IntegrationDocsProtocol']
      ].map(([tab, label]) => ({
        label,
        to: {
          name: 'IntegrationApplicationList',
          query: {
            tab: 'docs',
            documentation: tab,
            ...(tab === 'sdk' ? { sdk_language: 'python' } : {})
          }
        }
      }))
    },
    documentationSections() {
      const paragraph = (key, params) => `${this.$t(key, params)}\n\n`
      return [
        {
          id: 'lifecycle',
          title: 'PolicyDocsLifecycle',
          content: paragraph('PolicyDocsCycleSteps', {
            verification: this.$t(
              this.object.verify_before_switch === false
                ? 'PolicyDocsVerificationSkipped'
                : 'PolicyDocsVerificationRequired'
            ),
            days: this.object.source_no_traffic_days ?? 7
          })
        },
        {
          id: 'requirements',
          title: 'PolicyDocsRequirements',
          content: paragraph('PolicyDocsSDKRequirement') + paragraph('PolicyDocsAgentRequirement')
        },
        {
          id: 'blockers',
          title: 'PolicyDocsBlockers',
          content: paragraph('PolicyDocsBlockerGuide')
        },
        {
          id: 'recovery',
          title: 'PolicyDocsRecoveryGuide',
          content:
            paragraph('PolicyDocsCancellation') +
            paragraph('PolicyDocsUncertainChange') +
            paragraph('PolicyDocsForceStop')
        },
        {
          id: 'events',
          title: 'PolicyDocsProtocol',
          content: paragraph('PolicyDocsRotationEventFlow')
        }
      ]
    }
  },
  methods: {
    async exportPdf() {
      if (this.exportLoading) return
      this.exportLoading = true
      try {
        await this.$nextTick()
        await printDocumentation(this.$refs.document, {
          title: `JumpServer PAM - ${this.modeLabel} - ${this.object.name || this.object.key}`,
          language: this.$i18n.locale
        })
      } catch {
        this.$message.error(this.$t('Failed'))
      } finally {
        this.exportLoading = false
      }
    },
    scrollToSection(id) {
      const section = this.$refs.document?.querySelector(`[data-section="${id}"]`)
      if (!section) return
      section.scrollIntoView({ block: 'start' })
      section.focus({ preventScroll: true })
    }
  }
}
</script>

<style lang="scss" scoped>
.policy-documentation-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  h5 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
  }
}

.policy-documentation {
  color: var(--el-text-color-primary);
  font-size: 13px;
  line-height: 1.75;
}
.policy-documentation-body {
  max-width: 1000px;
  min-width: 0;
  width: 100%;
  margin: 0 auto;
  color: var(--el-text-color-primary);
}
.policy-documentation-introduction > p {
  margin: 12px 0 16px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.policy-documentation-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  > span {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  code {
    overflow-wrap: anywhere;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
}
.policy-documentation-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 16px;
  font-size: 12px;
}

.policy-documentation-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 16px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 12px;

  > span {
    color: var(--el-text-color-secondary);
  }

  button {
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: var(--el-color-primary);
    font: inherit;
    cursor: pointer;
    text-align: left;

    &:hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 3px;
    }
  }
}
.policy-documentation-section {
  min-width: 0;
  scroll-margin-top: 16px;

  > h2 {
    margin: 0 0 16px;
    font-size: 15px;
    line-height: 1.5;
    font-weight: 600;
  }

  + .policy-documentation-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.policy-documentation-content {
  :deep(h3) {
    margin: 20px 0 10px;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 600;
  }

  :deep(> h3:first-child) {
    margin-top: 0;
  }

  :deep(p),
  :deep(ol),
  :deep(ul) {
    margin: 0 0 14px;
  }

  :deep(ol),
  :deep(ul) {
    padding-left: 22px;
  }

  :deep(li) {
    margin: 6px 0;
  }

  :deep(table) {
    display: block;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }

  :deep(th),
  :deep(td) {
    min-width: 140px;
    padding: 8px 10px;
    border: 1px solid var(--el-border-color-lighter);
    text-align: left;
    vertical-align: top;
    overflow-wrap: anywhere;
  }

  :deep(th) {
    background: var(--el-fill-color-light);
    font-size: 12px;
    font-weight: 600;
  }

  :deep(td:first-child code) {
    white-space: normal;
  }

  :deep(code:not(pre code)) {
    padding: 2px 4px;
    border-radius: 4px;
    background: var(--el-fill-color-light);
    overflow-wrap: anywhere;
    font-size: 12px;
  }

  :deep(.markdown-code-block) {
    border-radius: 4px;
  }

  :deep(pre) {
    padding: 12px;
    background: var(--el-fill-color-light);
    line-height: 1.6;
  }

  :deep(pre code) {
    background: transparent;
    color: var(--el-text-color-primary);
    font-size: 12px;
  }

  :deep(> :last-child) {
    margin-bottom: 0;
  }
}
</style>
