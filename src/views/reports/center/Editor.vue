<template>
  <Page :title="$t('AuditReportConfigure')" class="audit-report-editor">
    <div class="editor-workspace" v-loading="loading">
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon>
        <el-button v-if="!catalog" text type="primary" @click="load">{{
          $t('AuditReportRetry')
        }}</el-button>
      </el-alert>
      <template v-if="catalog && form.theme">
        <el-alert
          v-if="!catalog.can_save_template"
          :title="$t('AuditReportChooseOrg')"
          type="info"
          :closable="false"
          show-icon
        />
        <div class="editor-toolbar">
          <el-steps :active="snapshot ? 1 : 0" simple class="workflow">
            <el-step :title="$t('AuditReportConfigureStep')" />
            <el-step :title="$t('AuditReportPreviewStep')" />
            <el-step :title="$t('AuditReportExportStep')" />
          </el-steps>
          <div class="toolbar-actions">
            <el-button :disabled="busy || !canSaveTemplate" @click="openSaveTemplate">{{
              $t('AuditReportSaveTemplate')
            }}</el-button>
            <el-button
              :loading="previewLoading"
              :disabled="busy || !canPreview"
              @click="refreshPreview"
              >{{
                snapshot ? $t('AuditReportRefreshPreview') : $t('AuditReportPreview')
              }}</el-button
            >
            <el-button
              type="primary"
              :loading="exporting"
              :disabled="busy || !snapshot || !canPreview"
              @click="exportPdf"
              >{{ $t('AuditReportExportPdf') }}</el-button
            >
          </div>
        </div>
        <div class="editor-layout">
          <IBox class="config-panel">
            <el-tabs v-model="configTab">
              <el-tab-pane :label="$t('AuditReportContent')" name="content">
                <el-form
                  class="report-config-form"
                  label-position="top"
                  :disabled="busy"
                  @submit.prevent
                >
                  <el-form-item :label="$t('AuditReportTheme')">
                    <el-select v-model="form.theme" @change="changeTheme"
                      ><el-option
                        v-for="theme in themes"
                        :key="theme.key"
                        :label="theme.title"
                        :value="theme.key"
                        :disabled="!theme.can_generate"
                    /></el-select>
                  </el-form-item>
                  <el-form-item :label="$t('AuditReportTitle')" required>
                    <el-input
                      v-model="form.title"
                      maxlength="128"
                      show-word-limit
                      :placeholder="$t('AuditReportTitlePlaceholder')"
                    />
                  </el-form-item>
                  <el-form-item :label="$t('AuditReportDateRange')">
                    <PeriodPicker v-model="range" :disabled="busy" compact />
                    <p v-if="form.chapters.includes('inventory')" class="config-help help-block">
                      {{ $t('AuditReportInventoryCurrent') }}
                    </p>
                  </el-form-item>
                  <el-form-item :label="$t('AuditReportChapters')" required>
                    <p v-if="!hasDataChapter" class="chapter-error" role="alert">
                      {{ $t('AuditReportNeedDataChapter') }}
                    </p>
                    <p class="chapter-order-help">{{ $t('AuditReportChapterOrderHelp') }}</p>
                    <div ref="chapterList" class="chapter-list" role="list">
                      <div
                        v-for="(chapter, index) in chapterOrder"
                        :key="chapter.key"
                        class="chapter-row"
                        :data-chapter-key="chapter.key"
                        role="listitem"
                        :aria-posinset="index + 1"
                        :aria-setsize="chapterOrder.length"
                      >
                        <el-checkbox
                          :model-value="form.chapters.includes(chapter.key)"
                          @change="(checked) => toggleChapter(chapter.key, checked)"
                          >{{ chapter.title }}</el-checkbox
                        >
                        <button
                          type="button"
                          class="chapter-drag-handle"
                          :disabled="busy"
                          :aria-label="$t('AuditReportDragChapter', { name: chapter.title })"
                          :title="$t('AuditReportDragChapter', { name: chapter.title })"
                          @keydown.up.prevent="moveChapter(index, -1)"
                          @keydown.down.prevent="moveChapter(index, 1)"
                        >
                          <span class="chapter-grip" aria-hidden="true">
                            <i v-for="dot in 6" :key="dot" />
                          </span>
                        </button>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item
                    v-if="form.chapters.includes('conclusion')"
                    :label="$t('AuditReportConclusion')"
                  >
                    <el-input
                      v-model="form.conclusion"
                      type="textarea"
                      :rows="7"
                      maxlength="5000"
                      show-word-limit
                      :placeholder="$t('AuditReportConclusionPlaceholder')"
                    />
                    <p class="config-help help-block">{{ $t('AuditReportConclusionHelp') }}</p>
                    <el-button
                      v-if="form.conclusion"
                      text
                      type="primary"
                      @click="form.conclusion = ''"
                      >{{ $t('AuditReportUseSuggestedConclusion') }}</el-button
                    >
                    <el-button
                      v-else-if="snapshot?.conclusions?.length"
                      text
                      type="primary"
                      @click="form.conclusion = snapshot.conclusions.join('\n\n')"
                      >{{ $t('AuditReportEditSuggestedConclusion') }}</el-button
                    >
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              <el-tab-pane :label="$t('AuditReportHeaderBrand')" name="brand">
                <el-form
                  class="report-config-form"
                  label-position="top"
                  :disabled="busy"
                  @submit.prevent
                >
                  <el-form-item :label="$t('AuditReportHeader')"
                    ><el-input
                      v-model="form.header"
                      maxlength="128"
                      show-word-limit
                      :placeholder="$t('AuditReportHeaderPlaceholder')"
                  /></el-form-item>
                  <el-form-item
                    ><el-checkbox v-model="form.show_logo">{{
                      $t('AuditReportShowLogo')
                    }}</el-checkbox></el-form-item
                  >
                  <div class="brand-info">
                    <el-icon><InfoFilled /></el-icon>
                    <div>
                      <strong>{{ $t('AuditReportBrandInherited') }}</strong>
                      <p>{{ $t('AuditReportBrandHelp') }}</p>
                    </div>
                  </div>
                  <div class="brand-note">
                    <el-icon><Lock /></el-icon>
                    <p>{{ $t('AuditReportWatermarkHelp') }}</p>
                  </div>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </IBox>
          <IBox class="preview-panel" v-loading="previewLoading">
            <div class="preview-heading">
              <div>
                <strong>{{ $t('AuditReportDocumentPreview') }}</strong>
                <p>{{ $t('AuditReportPreviewHelp') }}</p>
              </div>
              <el-tag :type="previewFresh ? 'success' : 'info'">{{
                previewFresh ? $t('AuditReportPreviewCurrent') : $t('AuditReportPreviewPending')
              }}</el-tag>
            </div>
            <el-alert
              v-if="snapshot && !previewFresh"
              class="preview-status"
              :title="$t('AuditReportPreviewChanged')"
              type="warning"
              :closable="false"
              show-icon
            />
            <details v-if="snapshot?.coverage?.notes?.length" class="coverage-notice">
              <summary>{{ $t('AuditReportCoverageTitle') }}</summary>
              <ul class="coverage-notes">
                <li v-for="(note, index) in snapshot.coverage.notes" :key="index">{{ note }}</li>
              </ul>
            </details>
            <ReportDocument
              v-if="snapshot"
              ref="document"
              :snapshot="snapshot"
              :config="documentConfig"
            />
            <div v-else class="preview-empty">
              <el-icon><Document /></el-icon>
              <h3>{{ $t('AuditReportPreviewEmptyTitle') }}</h3>
              <p>{{ $t('AuditReportPreviewEmptyHelp') }}</p>
              <el-button type="primary" :disabled="busy || !canPreview" @click="refreshPreview">{{
                $t('AuditReportPreview')
              }}</el-button>
            </div>
          </IBox>
        </div>
      </template>
      <el-empty v-else-if="!loading && !error" :description="$t('AuditReportNoPermission')" />
    </div>
    <el-dialog
      v-model="templateDialog"
      :title="$t('AuditReportSaveTemplate')"
      width="min(480px, 94vw)"
      :close-on-click-modal="false"
      :close-on-press-escape="!savingTemplate"
      :show-close="!savingTemplate"
    >
      <el-form class="report-config-form" label-position="top" @submit.prevent="saveTemplate">
        <el-form-item :label="$t('AuditReportTemplateName')" required
          ><el-input
            v-model="templateName"
            maxlength="128"
            show-word-limit
            :disabled="savingTemplate"
        /></el-form-item>
        <p class="config-help help-block">{{ $t('AuditReportTemplateSaveHelp') }}</p>
        <el-alert v-if="templateError" :title="templateError" type="error" :closable="false" />
      </el-form>
      <template #footer
        ><el-button :disabled="savingTemplate" @click="templateDialog = false">{{
          $t('Cancel')
        }}</el-button
        ><el-button
          type="primary"
          :loading="savingTemplate"
          :disabled="!templateName.trim()"
          @click="saveTemplate"
          >{{
            $t(templateToUpdate ? 'AuditReportUpdateTemplate' : 'AuditReportSaveTemplate')
          }}</el-button
        ></template
      >
    </el-dialog>
  </Page>
</template>
<script>
import { markRaw } from 'vue'
import Sortable from 'sortablejs'
import { Page } from '@/layout/components'
import IBox from '@/components/Common/IBox/index.vue'
import PeriodPicker from './PeriodPicker.vue'
import ReportDocument from './ReportDocument.vue'
import { reportApi, reportError, makeConfig, configPayload, defaultRange } from './api'

export default {
  name: 'AuditReportEditor',
  components: { Page, IBox, PeriodPicker, ReportDocument },
  data() {
    return {
      active: true,
      catalog: null,
      loading: false,
      error: '',
      form: makeConfig('', []),
      snapshot: null,
      previewConfig: null,
      previewFingerprint: '',
      previewLoading: false,
      exporting: false,
      configTab: 'content',
      chapterOrder: [],
      chapterSortable: null,
      templateDialog: false,
      templateName: '',
      templateError: '',
      savingTemplate: false,
      loadedTemplate: null,
      requestId: 0,
      autoTitle: ''
    }
  },
  computed: {
    organizationId() {
      return this.$store.getters.currentOrg?.id
    },
    themes() {
      return this.catalog?.themes || []
    },
    currentTheme() {
      return this.themes.find((theme) => theme.key === this.form.theme)
    },
    busy() {
      return this.loading || this.previewLoading || this.exporting || this.savingTemplate
    },
    hasDataChapter() {
      return this.form.chapters.some((key) =>
        ['overview', 'activity', 'security', 'inventory', 'account'].includes(key)
      )
    },
    canPreview() {
      return (
        this.currentTheme?.can_generate && this.hasDataChapter && this.form.title.trim().length > 0
      )
    },
    canSaveTemplate() {
      return (
        this.canPreview && this.catalog?.can_save_template && this.currentTheme?.can_save_template
      )
    },
    range: {
      get() {
        return { start: this.form.start, end: this.form.end }
      },
      set(value) {
        this.form.start = value.start
        this.form.end = value.end
        this.refreshAutoTitle()
      }
    },
    fingerprint() {
      return JSON.stringify(configPayload(this.form))
    },
    previewFresh() {
      return Boolean(this.snapshot && this.previewFingerprint === this.fingerprint)
    },
    documentConfig() {
      return this.previewConfig || this.form
    },
    templateToUpdate() {
      return this.loadedTemplate && this.loadedTemplate.name === this.templateName.trim()
        ? this.loadedTemplate.id
        : null
    }
  },
  watch: {
    busy(value) {
      this.chapterSortable?.option('disabled', value)
    },
    organizationId() {
      if (this.active) this.load()
    }
  },
  mounted() {
    this.load()
  },
  activated() {
    if (!this.active) {
      this.active = true
      this.load()
    }
  },
  deactivated() {
    this.active = false
    this.requestId++
    this.destroyChapterDraggable()
  },
  beforeUnmount() {
    this.requestId++
    this.destroyChapterDraggable()
  },
  methods: {
    async load() {
      this.destroyChapterDraggable()
      const id = ++this.requestId
      this.loading = true
      this.previewLoading = false
      this.exporting = false
      this.savingTemplate = false
      this.error = ''
      this.catalog = null
      this.snapshot = null
      this.previewConfig = null
      this.previewFingerprint = ''
      this.loadedTemplate = null
      this.templateDialog = false
      this.form = makeConfig('', [])
      this.chapterOrder = []
      this.autoTitle = ''
      try {
        const catalog = await reportApi.catalog()
        if (id !== this.requestId) return
        this.catalog = catalog
        if (this.$route.query.template_id) {
          const template = await reportApi.template(this.$route.query.template_id)
          if (id !== this.requestId) return
          this.loadedTemplate = template
          this.form = configPayload({
            ...makeConfig(template.theme, []),
            ...template.config,
            theme: template.theme
          })
        } else {
          const theme =
            this.themes.find((item) => item.key === this.$route.query.theme && item.can_generate) ||
            this.themes.find((item) => item.can_generate)
          if (!theme) return
          const query = this.$route.query
          const range =
            /^\d{4}-\d{2}-\d{2}$/.test(query.start || '') &&
            /^\d{4}-\d{2}-\d{2}$/.test(query.end || '')
              ? { start: query.start, end: query.end }
              : defaultRange()
          this.form = makeConfig(theme.key, theme.chapters || [], range)
          this.refreshAutoTitle()
        }
        this.buildChapterOrder()
      } catch (error) {
        if (id === this.requestId) this.error = reportError(error, this.$t('AuditReportLoadFailed'))
      } finally {
        if (id === this.requestId) {
          this.loading = false
          await this.$nextTick()
          if (this.active && id === this.requestId) this.setChapterDraggable()
        }
      }
    },
    refreshAutoTitle() {
      const title = this.$t('AuditReportDefaultTitle', {
        theme: this.currentTheme?.title || '',
        start: this.form.start,
        end: this.form.end
      })
      if (!this.form.title || this.form.title === this.autoTitle) {
        this.form.title = title.slice(0, 128)
      }
      this.autoTitle = title.slice(0, 128)
    },
    buildChapterOrder() {
      const chapters = this.catalog?.chapters || []
      const available = this.currentTheme?.chapters || chapters.map((chapter) => chapter.key)
      const ordered = [
        ...this.form.chapters,
        ...available.filter((key) => !this.form.chapters.includes(key))
      ]
      this.chapterOrder = ordered
        .map((key) => chapters.find((chapter) => chapter.key === key) || { key, title: key })
        .filter((chapter) => available.includes(chapter.key))
      this.form.chapters = this.form.chapters.filter((key) => available.includes(key))
    },
    changeTheme() {
      this.form.chapters = [...(this.currentTheme?.chapters || [])]
      this.loadedTemplate = null
      this.snapshot = null
      this.previewConfig = null
      this.previewFingerprint = ''
      this.form.conclusion = ''
      this.refreshAutoTitle()
      this.buildChapterOrder()
    },
    toggleChapter(key, checked) {
      const selected = new Set(this.form.chapters)
      if (checked) selected.add(key)
      else selected.delete(key)
      this.form.chapters = this.chapterOrder
        .filter((chapter) => selected.has(chapter.key))
        .map((chapter) => chapter.key)
    },
    destroyChapterDraggable() {
      this.chapterSortable?.destroy()
      this.chapterSortable = null
    },
    setChapterDraggable() {
      const el = this.$refs.chapterList
      if (!this.active || !el || this.chapterSortable?.el === el) return
      this.destroyChapterDraggable()
      const getRows = () =>
        Array.from(el.children).filter(
          (row) => row !== Sortable.ghost && row !== Sortable.clone && row.dataset.chapterKey
        )
      let originalRows = []
      this.chapterSortable = markRaw(
        Sortable.create(el, {
          animation: 150,
          direction: 'vertical',
          draggable: '.chapter-row',
          handle: '.chapter-drag-handle',
          disabled: this.busy,
          forceFallback: true,
          fallbackOnBody: true,
          fallbackTolerance: 4,
          ghostClass: 'chapter-row-ghost',
          chosenClass: 'chapter-row-chosen',
          dragClass: 'chapter-row-dragging',
          onStart: () => {
            originalRows = getRows()
          },
          onEnd: () => {
            const keys = getRows().map((row) => row.dataset.chapterKey)
            // Restore Vue's DOM order before updating the keyed chapter model.
            originalRows.forEach((row) => el.appendChild(row))
            originalRows = []
            this.applyChapterOrder(keys)
          }
        })
      )
    },
    applyChapterOrder(keys) {
      if (this.busy) return
      const chapters = new Map(this.chapterOrder.map((chapter) => [chapter.key, chapter]))
      if (
        keys.length !== chapters.size ||
        new Set(keys).size !== keys.length ||
        keys.some((key) => !chapters.has(key))
      ) {
        return
      }
      const selected = new Set(this.form.chapters)
      this.chapterOrder = keys.map((key) => chapters.get(key))
      this.form.chapters = keys.filter((key) => selected.has(key))
    },
    moveChapter(index, direction) {
      if (this.busy) return
      const other = index + direction
      if (other < 0 || other >= this.chapterOrder.length) return
      const keys = this.chapterOrder.map((chapter) => chapter.key)
      const [key] = keys.splice(index, 1)
      keys.splice(other, 0, key)
      this.applyChapterOrder(keys)
      this.$nextTick(() => {
        const row = Array.from(this.$refs.chapterList?.children || []).find(
          (item) => item.dataset.chapterKey === key
        )
        row?.querySelector('.chapter-drag-handle')?.focus()
      })
    },
    async refreshPreview() {
      if (!this.canPreview) return false
      const id = this.requestId
      const config = configPayload(this.form)
      this.previewLoading = true
      this.error = ''
      try {
        const snapshot = await reportApi.preview(config)
        if (id !== this.requestId) return false
        this.snapshot = snapshot
        this.previewConfig = config
        this.previewFingerprint = JSON.stringify(config)
        await this.$nextTick()
        return true
      } catch (error) {
        if (id === this.requestId) {
          this.error = reportError(error, this.$t('AuditReportPreviewFailed'))
        }
        return false
      } finally {
        if (id === this.requestId) this.previewLoading = false
      }
    },
    async exportPdf() {
      if (this.busy || !this.snapshot || !this.canPreview) return
      this.exporting = true
      this.error = ''
      const id = this.requestId
      try {
        if (!this.previewFresh && !(await this.refreshPreview())) return
        if (id !== this.requestId) return
        await this.$nextTick()
        await this.$refs.document.exportPdf({
          filename: `${this.form.title || this.$t('AuditReportTitle')}.pdf`
        })
        if (id === this.requestId) this.$message.success(this.$t('AuditReportExportSuccess'))
      } catch (error) {
        if (id === this.requestId) {
          this.error = reportError(error, this.$t('AuditReportExportFailed'))
        }
      } finally {
        if (id === this.requestId) this.exporting = false
      }
    },
    openSaveTemplate() {
      this.templateName = this.loadedTemplate?.name || this.form.title
      this.templateError = ''
      this.templateDialog = true
    },
    async saveTemplate() {
      if (!this.templateName.trim() || this.savingTemplate || !this.canSaveTemplate) return
      this.savingTemplate = true
      this.templateError = ''
      const id = this.requestId
      try {
        const template = await reportApi.saveTemplate(
          {
            name: this.templateName.trim(),
            theme: this.form.theme,
            config: configPayload(this.form)
          },
          this.templateToUpdate
        )
        if (id !== this.requestId) return
        this.loadedTemplate = template
        this.templateDialog = false
        this.$message.success(this.$t('AuditReportTemplateSaved'))
      } catch (error) {
        if (id === this.requestId) {
          this.templateError = reportError(error, this.$t('AuditReportActionFailed'))
        }
      } finally {
        if (id === this.requestId) this.savingTemplate = false
      }
    }
  }
}
</script>
<style scoped lang="scss">
.editor-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--page-section-gap, 8px);
  min-width: 0;
}
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px 20px;
  flex-wrap: wrap;
}
.toolbar-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
}
.toolbar-actions .el-button + .el-button {
  margin-left: 0;
}
.workflow {
  flex: 0 1 350px;
  min-width: 280px;
  padding: 10px 0;
  background: transparent;
}
.workflow :deep(.el-step__title) {
  font-size: 12px;
  white-space: nowrap;
}
.workflow :deep(.el-step.is-simple .el-step__head) {
  padding-right: 6px;
}
.workflow :deep(.el-step.is-simple .el-step__arrow) {
  min-width: 20px;
}
.editor-layout {
  display: grid;
  grid-template-columns: 350px minmax(0, 1fr);
  gap: var(--page-section-gap, 8px);
  align-items: stretch;
}
.config-panel,
.preview-panel {
  min-width: 0;
}
.preview-panel {
  display: flex;
  flex-direction: column;
}
.config-panel :deep(.el-tabs__header) {
  margin-bottom: 20px;
}
.config-panel :deep(.el-tabs__item) {
  font-size: 13px;
}
.report-config-form.el-form {
  margin: 0;
  padding: 0;
}
.report-config-form.el-form :deep(.el-form-item) {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 20px;
}
.report-config-form.el-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
.report-config-form.el-form :deep(.el-form-item__label) {
  display: flex;
  justify-content: flex-start;
  width: auto;
  height: auto;
  min-height: 0;
  margin: 0 0 6px;
  padding: 0;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
}
.report-config-form.el-form :deep(.el-form-item__content) {
  display: block;
  min-width: 0;
  margin-left: 0;
  line-height: 20px;
}
.report-config-form :deep(.el-form-item__content > .el-select),
.report-config-form :deep(.el-form-item__content > .el-input),
.report-config-form :deep(.el-form-item__content > .el-textarea) {
  width: 100%;
}
.report-config-form :deep(.el-checkbox.el-checkbox--small) {
  height: auto;
  min-height: 30px;
  margin-right: 0;
  line-height: 20px;
}
.report-config-form :deep(.el-checkbox__label) {
  min-width: 0;
  padding-block: 5px;
  font-size: 13px;
  line-height: 20px;
  white-space: normal;
  overflow-wrap: anywhere;
}
.chapter-error {
  margin: 0 0 8px;
  color: var(--color-danger);
  font-size: 12px;
  line-height: 18px;
}
.chapter-list {
  width: 100%;
  border-top: 1px solid var(--panel-border-color, var(--el-border-color-lighter));
}
.chapter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 38px;
  border-bottom: 1px solid var(--panel-border-color, var(--el-border-color-lighter));
}
.chapter-row .el-checkbox {
  flex: 1 1 auto;
  min-width: 0;
}
.chapter-order-help {
  margin: 0 0 8px;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 18px;
}
.chapter-drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: var(--el-border-radius-base, 4px);
  background: transparent;
  color: var(--color-help-text);
  cursor: grab;
  touch-action: none;
}
.chapter-drag-handle:hover,
.chapter-drag-handle:focus-visible {
  color: var(--color-primary);
  background: var(--el-color-primary-light-9);
}
.chapter-drag-handle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
.chapter-drag-handle:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.chapter-grip {
  display: grid;
  grid-template-columns: repeat(2, 3px);
  gap: 2px;
}
.chapter-grip i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
}
.chapter-row-ghost {
  opacity: 0.35;
  background: var(--el-color-primary-light-9);
}
.chapter-row-chosen,
.chapter-row-dragging {
  background: var(--page-background-color, #fff);
}
.chapter-row-chosen .chapter-drag-handle,
.chapter-row-dragging .chapter-drag-handle {
  cursor: grabbing;
}
.report-config-form :deep(.config-help.help-block) {
  display: block;
  width: 100%;
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}
.brand-info,
.brand-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 18px;
}
.brand-info {
  padding-top: 16px;
  border-top: 1px solid var(--panel-border-color, var(--el-border-color-lighter));
}
.brand-info strong {
  display: block;
  margin-bottom: 4px;
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 500;
}
.brand-note {
  margin-top: 16px;
}
.brand-info .el-icon,
.brand-note .el-icon {
  flex: 0 0 auto;
  margin-top: 2px;
}
.brand-info p,
.brand-note p {
  margin: 0;
}
.preview-panel :deep(.el-card__body) {
  flex: 1 1 auto;
  gap: 12px;
  min-width: 0;
}
.preview-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.preview-heading .el-tag {
  flex: 0 0 auto;
}
.preview-heading strong {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
.preview-heading p {
  margin: 4px 0 0;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 18px;
}
.preview-status :deep(.el-alert__title) {
  font-size: 12px;
  line-height: 18px;
}
.coverage-notice {
  padding: 8px 12px;
  border: 1px solid var(--panel-border-color, var(--el-border-color-lighter));
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 18px;
}
.coverage-notice summary {
  cursor: pointer;
}
.coverage-notes {
  padding-left: 18px;
  margin: 8px 0 0;
  color: var(--color-help-text);
}
.coverage-notes li + li {
  margin-top: 4px;
}
.preview-empty {
  flex: 1 1 auto;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-text-secondary);
}
.preview-empty > .el-icon {
  font-size: 32px;
  color: var(--color-help-text);
}
.preview-empty h3 {
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
  margin: 16px 0 4px;
}
.preview-empty p {
  max-width: 340px;
  font-size: 12px;
  line-height: 18px;
  margin-bottom: 16px;
}
@media (max-width: 1200px) {
  .editor-toolbar .toolbar-actions {
    flex: 1 0 100%;
  }
}
@media (max-width: 1000px) {
  .editor-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 500px) {
  .workflow {
    min-width: 0;
    flex-basis: 100%;
  }
  .toolbar-actions {
    justify-content: flex-start;
    margin-left: 0;
  }
}
</style>
