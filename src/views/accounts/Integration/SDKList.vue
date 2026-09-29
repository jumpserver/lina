<template>
  <IBox :title="$t('SDKCenter')" class="sdk-docs-shell">
    <template #header>
      <div class="documentation-toolbar">
        <h5>{{ $t('SDKCenter') }}</h5>
        <div class="documentation-controls">
          <el-select
            v-if="documentationTab === 'sdk'"
            :model-value="sdkLanguage"
            :aria-label="$t('SDKProgrammingLanguage')"
            class="sdk-language-select"
            @change="selectSDKLanguage"
          >
            <el-option
              v-for="language in sdkLanguages"
              :key="language.value"
              :label="language.label"
              :value="language.value"
            />
          </el-select>
          <el-radio-group
            :model-value="documentationTab"
            :aria-label="$t('SDKCenter')"
            @update:model-value="selectDocumentation"
          >
            <el-radio-button value="agent">{{ $t('AgentAccess') }}</el-radio-button>
            <el-radio-button value="sdk">{{ $t('SDKAccess') }}</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </template>

    <main ref="docsMain" class="sdk-docs-main">
      <el-skeleton v-if="documentationLoading" :rows="8" animated />

      <div v-else-if="documentationError" class="documentation-state" role="alert">
        <h3>{{ $t('LoadFailed') }}</h3>
        <p>{{ $t('SDKDocumentationLoadFailed') }}</p>
        <el-button type="primary" @click="loadDocumentation">{{ $t('Retry') }}</el-button>
      </div>

      <el-empty v-else-if="!hasDocumentation" :description="$t('SDKDocumentationEmpty')">
        <el-button @click="loadDocumentation">{{ $t('Retry') }}</el-button>
      </el-empty>

      <template v-else>
        <header class="documentation-header">
          <h1>{{ $t(documentationTab === 'agent' ? 'AgentAccess' : 'SDKAccess') }}</h1>
          <p>{{ $t(documentationDescription) }}</p>
          <div class="documentation-meta">
            <template v-if="documentationTab === 'agent'">
              <el-tag effect="plain" size="small">Linux</el-tag>
              <el-tag effect="plain" size="small" type="info">systemd</el-tag>
            </template>
            <template v-else>
              <el-tag effect="plain" size="small">{{ sdkRuntime }}</el-tag>
              <el-tag effect="plain" size="small" type="info">
                {{ $t(credentialPolicies ? 'ApplicationCredential' : 'SDKLegacyExample') }}
              </el-tag>
            </template>
          </div>
        </header>

        <el-empty v-if="!activeDocument" :description="$t('SDKDocumentationEmpty')" />
        <div v-else class="documentation-layout" :class="{ 'has-outline': headings.length }">
          <nav v-if="headings.length" class="documentation-jump" :aria-label="$t('OnThisPage')">
            <span>{{ $t('OnThisPage') }}</span>
            <el-select
              :model-value="activeHeading"
              :aria-label="$t('OnThisPage')"
              @change="scrollToHeading"
            >
              <el-option
                v-for="heading in headings"
                :key="heading.id"
                :label="heading.text"
                :value="heading.id"
              />
            </el-select>
          </nav>
          <article class="documentation-content">
            <MarkdownRenderer
              :source="activeDocument"
              collect-headings
              copyable-code
              class="readme-content"
              @headings-change="onHeadingsChange"
            />
          </article>

          <aside v-if="headings.length" class="documentation-outline">
            <nav :aria-label="$t('OnThisPage')">
              <h3>{{ $t('OnThisPage') }}</h3>
              <button
                v-for="heading in headings"
                :key="heading.id"
                :class="[
                  'outline-link',
                  `outline-link--level-${heading.level}`,
                  { active: activeHeading === heading.id }
                ]"
                type="button"
                @click="scrollToHeading(heading.id)"
              >
                {{ heading.text }}
              </button>
            </nav>
          </aside>
        </div>
      </template>
    </main>
  </IBox>
</template>

<script>
import MarkdownRenderer from '@/components/Widgets/MarkdownRenderer/index.vue'
import IBox from '@/components/Common/IBox/index.vue'

export default {
  name: 'SDKList',
  components: {
    IBox,
    MarkdownRenderer
  },
  data() {
    return {
      activeHeading: '',
      documentationError: false,
      documentationLoading: false,
      documentationRequestId: 0,
      documentationTab: 'agent',
      credentialPolicies: true,
      headingObserver: null,
      headings: [],
      readme: '',
      sdkLanguage: 'python',
      sdkLanguages: [
        { value: 'python', label: 'Python' },
        { value: 'go', label: 'Go' },
        { value: 'java', label: 'Java' },
        { value: 'node', label: 'Node.js' }
      ],
      sdkRuntime: 'Python 3.9+'
    }
  },
  computed: {
    activeLanguage() {
      return this.documentationTab === 'agent' ? 'python' : this.sdkLanguage
    },
    documentationDescription() {
      if (this.documentationTab === 'agent') return 'AgentDescription'
      return this.credentialPolicies ? 'SDKDescription' : 'SDKLegacyDescription'
    },
    activeDocument() {
      const marker = `${this.documentationTab}-doc`
      const startMarker = `<!-- ${marker}:start -->`
      const endMarker = `<!-- ${marker}:end -->`
      const start = this.readme.indexOf(startMarker)
      const end = this.readme.indexOf(endMarker)
      if (start === -1 || end === -1 || end <= start) return this.readme
      return this.readme.slice(start + startMarker.length, end).trim()
    },
    hasDocumentation() {
      return Boolean(this.readme)
    }
  },
  watch: {
    '$i18n.locale'() {
      this.loadDocumentation()
    }
  },
  mounted() {
    this.loadDocumentation()
  },
  beforeUnmount() {
    this.documentationRequestId += 1
    this.disconnectHeadingObserver()
  },
  methods: {
    async loadDocumentation() {
      const requestId = ++this.documentationRequestId
      const language = this.activeLanguage
      this.disconnectHeadingObserver()
      this.headings = []
      this.activeHeading = ''
      this.documentationLoading = true
      this.documentationError = false
      try {
        const data = await this.$axios.get('/api/v1/accounts/integration-applications/sdks/', {
          params: { language }
        })
        if (requestId !== this.documentationRequestId) return
        this.readme = data.readme || ''
        this.sdkRuntime = data.runtime || language
        this.credentialPolicies = data.credential_policies ?? language === 'python'
        if (data.languages?.length) this.sdkLanguages = data.languages
      } catch {
        if (requestId !== this.documentationRequestId) return
        this.readme = ''
        this.documentationError = true
      } finally {
        if (requestId === this.documentationRequestId) this.documentationLoading = false
      }
    },
    onHeadingsChange(headings) {
      this.headings = headings
      this.activeHeading = headings[0]?.id || ''
      this.$nextTick(this.observeHeadings)
    },
    selectDocumentation(tab) {
      if (this.documentationTab === tab) return
      const previousLanguage = this.activeLanguage
      this.disconnectHeadingObserver()
      this.documentationTab = tab
      this.headings = []
      this.activeHeading = ''
      this.$refs.docsMain?.scrollTo({ top: 0 })
      if (previousLanguage !== this.activeLanguage) this.loadDocumentation()
    },
    selectSDKLanguage(language) {
      if (this.sdkLanguage === language) return
      this.sdkLanguage = language
      this.$refs.docsMain?.scrollTo({ top: 0 })
      this.loadDocumentation()
    },
    disconnectHeadingObserver() {
      this.headingObserver?.disconnect()
      this.headingObserver = null
    },
    observeHeadings() {
      this.disconnectHeadingObserver()
      const container = this.$refs.docsMain
      if (!container || !this.headings.length || !window.IntersectionObserver) return

      this.headingObserver = new IntersectionObserver(
        (entries) => {
          const [heading] = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          if (heading) this.activeHeading = heading.target.id
        },
        {
          root: container,
          rootMargin: '-16px 0px -70% 0px'
        }
      )
      this.headings.forEach(({ id }) => {
        const heading = document.getElementById(id)
        if (heading) this.headingObserver.observe(heading)
      })
    },
    scrollToHeading(id) {
      const target = document.getElementById(id)
      const container = this.$refs.docsMain
      if (!target || !container) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const top =
        container.scrollTop +
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        16
      container.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' })
      this.activeHeading = id
    }
  }
}
</script>

<style lang="scss" scoped>
.sdk-docs-shell {
  display: flex;
  flex-direction: column;
  container-type: inline-size;
  height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  flex: 1 1 auto !important;
}

.sdk-docs-shell :deep(> .el-card__header) {
  flex-shrink: 0;
}

.sdk-docs-shell :deep(> .el-card__body) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.documentation-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.documentation-toolbar h5 {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}

.documentation-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.sdk-language-select {
  width: 128px;
}

.sdk-docs-main {
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  color: var(--el-text-color-primary);
}

.documentation-header {
  max-width: 1240px;
  margin: 0 auto 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.documentation-header h1 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.documentation-header p {
  max-width: 80ch;
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.75;
}

.documentation-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.documentation-state {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.documentation-state h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.documentation-state p {
  max-width: 52ch;
  margin: 0 0 16px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 1.6;
}

.documentation-layout {
  display: grid;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  align-items: start;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr);
}

.documentation-layout.has-outline {
  grid-template-columns: minmax(0, 1fr) 200px;
}

.documentation-content {
  min-width: 0;
}

.documentation-jump {
  display: none;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.documentation-jump :deep(.el-select) {
  flex: 1 1 220px;
  min-width: 0;
  max-width: 460px;
}

.documentation-outline {
  position: sticky;
  top: 0;
  min-width: 0;
  align-self: start;
  grid-column: 2;
  grid-row: 1;
  max-height: 70vh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.documentation-outline nav {
  display: flex;
  padding-left: 16px;
  border-left: 1px solid var(--el-border-color-lighter);
  flex-direction: column;
  gap: 3px;
}

.documentation-outline h3 {
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.outline-link {
  min-height: 30px;
  padding: 5px 8px;
  border: 0;
  border-radius: 4px;
  color: var(--el-text-color-regular);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
  overflow-wrap: anywhere;
}

.outline-link--level-3 {
  padding-left: 20px;
}

.outline-link:hover,
.outline-link.active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.outline-link:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.readme-content {
  width: 100%;
  max-width: 1000px;
  color: var(--el-text-color-primary);
  font-size: 13px;
  line-height: 1.75;
}

.readme-content :deep(h1:first-child) {
  display: none;
}

.readme-content :deep(h2),
.readme-content :deep(h3) {
  color: var(--el-text-color-primary);
  line-height: 1.5;
  scroll-margin-top: 16px;
}

.readme-content :deep(h2) {
  margin: 28px 0 12px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  font-size: 16px;
  font-weight: 600;
}

.readme-content :deep(h2:first-of-type) {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

.readme-content :deep(h3) {
  margin: 20px 0 10px;
  font-size: 13px;
  font-weight: 600;
}

.readme-content :deep(p),
.readme-content :deep(ul),
.readme-content :deep(ol) {
  margin: 0 0 14px;
}

.readme-content :deep(ul),
.readme-content :deep(ol) {
  padding-left: 22px;
}

.readme-content :deep(li) {
  margin: 5px 0;
}

.readme-content :deep(code:not(pre code)) {
  padding: 2px 4px;
  border-radius: 4px;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.readme-content :deep(.markdown-code-block) {
  border-radius: 4px;
}

.readme-content :deep(pre) {
  padding: 12px;
  background: var(--el-fill-color-light);
  line-height: 1.6;
}

.readme-content :deep(pre code) {
  background: transparent;
  color: var(--el-text-color-primary);
  font-size: 12px;
}

.readme-content :deep(blockquote) {
  margin: 16px 0;
  padding: 10px 14px;
  border-left: 2px solid var(--el-color-primary);
  color: var(--el-text-color-regular);
  background: var(--el-color-primary-light-9);
}

.readme-content :deep(blockquote > :last-child) {
  margin-bottom: 0;
}

.readme-content :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 16px 0;
  overflow-x: auto;
  border-collapse: collapse;
}

.readme-content :deep(th),
.readme-content :deep(td) {
  min-width: 140px;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-lighter);
  text-align: left;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.readme-content :deep(th) {
  background: var(--el-fill-color-light);
  font-size: 12px;
  font-weight: 600;
}

.readme-content :deep(a) {
  color: var(--el-color-primary);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.readme-content :deep(*)::selection {
  background: var(--el-color-primary-light-7);
}

@container (max-width: 1000px) {
  .documentation-layout.has-outline {
    grid-template-columns: minmax(0, 1fr);
  }

  .documentation-jump {
    display: flex;
  }

  .documentation-outline {
    display: none;
  }
}
</style>
