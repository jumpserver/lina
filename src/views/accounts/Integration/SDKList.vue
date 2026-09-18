<template>
  <div class="sdk-docs-shell">
    <aside class="sdk-docs-sidebar">
      <h2>{{ $t('SDKCenter') }}</h2>
      <nav class="sidebar-group" :aria-label="$t('SDKCenter')">
        <button
          :class="['sidebar-link', { active: documentationTab === 'agent' }]"
          type="button"
          @click="selectDocumentation('agent')"
        >
          {{ $t('AgentAccess') }}
        </button>
        <button
          :class="['sidebar-link', { active: documentationTab === 'sdk' }]"
          type="button"
          @click="selectDocumentation('sdk')"
        >
          {{ $t('SDKAccess') }}
        </button>
      </nav>
    </aside>

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
          <p>{{ $t(documentationTab === 'agent' ? 'AgentDescription' : 'SDKDescription') }}</p>
          <div class="documentation-meta">
            <template v-if="documentationTab === 'agent'">
              <el-tag effect="plain" size="small">Linux</el-tag>
              <el-tag effect="plain" size="small" type="info">systemd</el-tag>
            </template>
            <template v-else>
              <el-tag effect="plain" size="small">Python 3.9+</el-tag>
              <el-tag effect="plain" size="small" type="info">PyPI</el-tag>
            </template>
          </div>
        </header>

        <el-empty v-if="!activeDocument" :description="$t('SDKDocumentationEmpty')" />
        <div v-else class="documentation-layout">
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
  </div>
</template>

<script>
import MarkdownRenderer from '@/components/Widgets/MarkdownRenderer/index.vue'

export default {
  name: 'SDKList',
  components: {
    MarkdownRenderer
  },
  data() {
    return {
      activeHeading: '',
      documentationError: false,
      documentationLoading: false,
      documentationTab: 'agent',
      headings: [],
      readme: ''
    }
  },
  computed: {
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
  methods: {
    async loadDocumentation() {
      this.documentationLoading = true
      this.documentationError = false
      try {
        const data = await this.$axios.get('/api/v1/accounts/integration-applications/sdks/', {
          params: { language: 'python' }
        })
        this.readme = data.readme || ''
      } catch {
        this.readme = ''
        this.documentationError = true
      } finally {
        this.documentationLoading = false
      }
    },
    onHeadingsChange(headings) {
      this.headings = headings
      this.activeHeading = headings[0]?.id || ''
    },
    selectDocumentation(tab) {
      if (this.documentationTab === tab) return
      this.documentationTab = tab
      this.headings = []
      this.activeHeading = ''
      this.$refs.docsMain?.scrollTo({ top: 0 })
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
  display: grid;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  color: var(--color-text-primary);
  background: var(--el-bg-color);
  flex: 1 1 auto !important;
  grid-template-columns: 220px minmax(0, 1fr);
}

.sdk-docs-sidebar {
  padding: 24px 18px;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.sdk-docs-sidebar h2 {
  margin: 0 0 28px;
  padding: 0 10px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-link {
  width: 100%;
  min-height: 38px;
  padding: 8px 10px;
  border: 0;
  border-radius: 4px;
  color: var(--color-text-primary);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
}

.sidebar-link:hover {
  background: var(--el-fill-color);
}

.sidebar-link.active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  font-weight: 600;
}

.sidebar-link:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.sdk-docs-main {
  height: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 32px 40px 48px;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.documentation-header {
  max-width: 880px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.documentation-header h1 {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.25;
}

.documentation-header p {
  max-width: 68ch;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.documentation-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
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
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.documentation-layout {
  display: grid;
  width: 100%;
  align-items: start;
  justify-content: space-between;
  gap: 48px;
  grid-template-columns: minmax(0, 880px) minmax(180px, 220px);
}

.documentation-content {
  min-width: 0;
  grid-column: 1;
  grid-row: 1;
}

.documentation-outline {
  position: sticky;
  top: 16px;
  min-width: 0;
  align-self: start;
  grid-column: 2;
  grid-row: 1;
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
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 600;
}

.outline-link {
  min-height: 32px;
  padding: 5px 8px;
  overflow: hidden;
  border: 0;
  border-radius: 4px;
  color: var(--color-text-secondary);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  line-height: 1.45;
  text-align: left;
  text-overflow: ellipsis;
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
  max-width: 880px;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.75;
}

.readme-content :deep(h1:first-child) {
  display: none;
}

.readme-content :deep(h2),
.readme-content :deep(h3) {
  color: var(--color-text-primary);
  line-height: 1.4;
  scroll-margin-top: 16px;
}

.readme-content :deep(h2) {
  margin: 36px 0 12px;
  font-size: 19px;
  font-weight: 600;
}

.readme-content :deep(h2:first-of-type) {
  margin-top: 0;
}

.readme-content :deep(h3) {
  margin: 28px 0 10px;
  font-size: 15px;
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

.readme-content :deep(code:not(.hljs code)) {
  padding: 2px 5px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  color: var(--el-color-primary-dark-2);
  background: var(--el-fill-color-light);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}

.readme-content :deep(blockquote) {
  margin: 18px 0;
  padding: 10px 14px;
  border-left: 1px solid var(--el-color-primary);
  color: var(--color-text-secondary);
  background: var(--el-color-primary-light-9);
}

.readme-content :deep(table) {
  display: block;
  width: 100%;
  margin: 18px 0;
  overflow-x: auto;
  border-collapse: collapse;
}

.readme-content :deep(th),
.readme-content :deep(td) {
  padding: 9px 12px;
  border: 1px solid var(--el-border-color-lighter);
  text-align: left;
}

.readme-content :deep(th) {
  background: var(--el-fill-color-light);
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

@media (max-width: 991px) {
  .sdk-docs-shell {
    display: flex;
    flex-direction: column;
  }

  .sdk-docs-sidebar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .sdk-docs-sidebar h2 {
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }

  .sidebar-group {
    flex-direction: row;
  }

  .sidebar-link {
    width: auto;
    white-space: nowrap;
  }

  .sdk-docs-main {
    height: auto;
    min-height: 0;
    padding: 24px 20px 36px;
    flex: 1 1 auto;
  }

  .documentation-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .documentation-outline {
    position: static;
    width: 100%;
    order: -1;
  }

  .documentation-outline nav {
    position: static;
    padding: 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    background: var(--el-fill-color-lighter);
  }
}

@media (max-width: 767px) {
  .sdk-docs-sidebar h2 {
    display: none;
  }

  .sdk-docs-main {
    padding: 20px 16px 32px;
  }

  .documentation-header h1 {
    font-size: 25px;
  }
}
</style>
