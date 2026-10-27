<template>
  <section class="audit-report-document" :aria-label="$t('AuditReportDocPreview')">
    <div v-if="!snapshot" class="rd-empty">{{ $t('AuditReportDocEmpty') }}</div>
    <template v-else>
      <div class="rd-pager">
        <el-button :disabled="currentPage <= 1 || preparing" @click="showPage(currentPage - 1)">
          {{ $t('AuditReportDocPrevious') }}
        </el-button>
        <span aria-live="polite">
          {{
            preparing
              ? $t('AuditReportDocLayout')
              : $t('AuditReportDocPage', { current: currentPage, total: pageCount })
          }}
        </span>
        <el-button
          :disabled="currentPage >= pageCount || preparing"
          @click="showPage(currentPage + 1)"
        >
          {{ $t('AuditReportDocNext') }}
        </el-button>
      </div>
      <el-alert v-if="layoutError" type="error" :closable="false" :title="layoutError" />
      <div ref="viewport" class="rd-viewport" :aria-busy="preparing">
        <!-- All visible page nodes are clones of escaped Vue text, never API-provided HTML. -->
        <div ref="pages" class="rd-pages" />
      </div>
      <div ref="source" class="rd-source" aria-hidden="true">
        <article class="rd-page rd-page-template">
          <header class="rd-page-header">
            <img
              v-if="config.show_logo !== false"
              :src="logo"
              alt=""
              class="rd-logo"
              @error="useDefaultLogo"
            />
            <div class="rd-header-text">{{ config.header || $t('AuditReportDocHeader') }}</div>
          </header>
          <div class="rd-page-body" />
          <div class="rd-watermark" data-report-watermark :style="watermarkStyle" />
          <footer class="rd-page-footer">
            <span>{{ organizationName }} · {{ formatDateTime(snapshot.generated_at) }}</span>
            <span data-report-page-number />
          </footer>
        </article>
        <div class="rd-source-blocks">
          <div data-report-block class="rd-intro">
            <div class="rd-document-kicker">{{ $t('AuditReportDocTitle') }}</div>
            <h1>{{ config.title || $t('AuditReportDocTitle') }}</h1>
            <dl>
              <div>
                <dt>{{ $t('AuditReportDocOrganization') }}</dt>
                <dd>{{ organizationName }}</dd>
              </div>
              <div>
                <dt>{{ $t('AuditReportDocPeriod') }}</dt>
                <dd>{{ period }}</dd>
              </div>
              <div v-if="snapshot.range?.timezone">
                <dt>{{ $t('AuditReportDocTimezone') }}</dt>
                <dd>{{ snapshot.range.timezone }}</dd>
              </div>
              <div>
                <dt>{{ $t('AuditReportDocGenerated') }}</dt>
                <dd>{{ formatDateTime(snapshot.generated_at) }}</dd>
              </div>
              <div v-if="snapshot.branding?.generated_by">
                <dt>{{ $t('AuditReportDocGeneratedBy') }}</dt>
                <dd>{{ snapshot.branding.generated_by }}</dd>
              </div>
            </dl>
          </div>
          <h2 v-if="coverageNotes.length" data-report-block data-keep-next>
            {{ $t('AuditReportDocCoverage') }}
          </h2>
          <p v-if="incomplete" data-report-block class="rd-status rd-status-warning">
            {{ $t('AuditReportDocIncomplete') }}
          </p>
          <p
            v-for="(note, index) in coverageNotes"
            :key="`coverage-${index}`"
            data-report-block
            class="rd-note"
          >
            {{ note }}
          </p>
          <template v-for="(section, index) in sections" :key="section.key">
            <h2 data-report-block data-keep-next>{{ index + 1 }}. {{ section.title }}</h2>
            <template v-if="section.key === 'conclusion'">
              <p data-report-block class="rd-note">
                {{
                  $t(
                    config.conclusion?.trim() ? 'AuditReportDocReviewed' : 'AuditReportDocAutomatic'
                  )
                }}
              </p>
              <p
                v-for="(paragraph, paragraphIndex) in conclusions"
                :key="paragraphIndex"
                data-report-block
                class="rd-conclusion"
              >
                {{ paragraph }}
              </p>
            </template>
            <template v-else>
              <p v-if="section.description" data-report-block class="rd-description">
                {{ section.description }}
              </p>
              <p
                v-if="section.status === 'unavailable' || section.status === 'permission_denied'"
                data-report-block
                class="rd-status rd-status-error"
              >
                {{ $t('AuditReportDocUnavailable') }}
              </p>
              <p
                v-else-if="section.status === 'partial'"
                data-report-block
                class="rd-status rd-status-warning"
              >
                {{ $t('AuditReportDocPartial') }}
              </p>
              <div
                v-for="(metrics, metricIndex) in metricGroups(section.metrics)"
                :key="`metrics-${metricIndex}`"
                data-report-block
                class="rd-metrics"
              >
                <div v-for="metric in metrics" :key="metric.key" class="rd-metric">
                  <div class="rd-metric-label">{{ metric.label }}</div>
                  <div class="rd-metric-value">
                    {{ metricValue(metric.value)
                    }}<small v-if="metric.value != null">{{ metric.unit }}</small>
                  </div>
                  <div v-if="metric.help" class="rd-metric-help">{{ metric.help }}</div>
                </div>
              </div>
              <p
                v-if="(section.metrics || []).some((metric) => metric.value == null)"
                data-report-block
                class="rd-note"
              >
                {{ $t('AuditReportDocValueUnavailable') }}
              </p>
              <div
                v-for="table in section.tables || []"
                :key="table.key"
                data-report-block="table"
                class="rd-table-block"
              >
                <div class="rd-table-caption">
                  <h3>{{ table.title }}</h3>
                  <p v-if="table.description" class="rd-note">{{ table.description }}</p>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th v-for="column in table.columns" :key="column.key">{{ column.label }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIndex) in table.rows || []" :key="rowIndex">
                      <td v-for="column in table.columns" :key="column.key">
                        {{ cellValue(row[column.key]) }}
                      </td>
                    </tr>
                    <tr v-if="!table.rows?.length">
                      <td :colspan="Math.max(1, table.columns?.length || 1)" class="rd-no-rows">
                        {{ $t('AuditReportDocNoRows') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p class="rd-table-total rd-note">{{ tableSummary(table) }}</p>
              </div>
              <p
                v-for="(note, noteIndex) in section.notes || []"
                :key="`note-${noteIndex}`"
                data-report-block
                class="rd-note"
              >
                {{ note }}
              </p>
            </template>
          </template>
        </div>
      </div>
    </template>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import defaultLogo from '@/assets/img/logo_text_green.png'
import { isDefaultInterfaceLogo } from '@/utils/interfaceLogo'
import {
  createReportWatermark,
  exportReportPages,
  REPORT_PAGE_HEIGHT,
  REPORT_PAGE_WIDTH
} from '@/utils/common/reportPdf'

export default {
  name: 'ReportDocument',
  props: {
    snapshot: { type: Object, default: null },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      currentPage: 1,
      pageCount: 0,
      preparing: false,
      layoutError: '',
      layoutVersion: 0,
      layoutPromise: null,
      resizeObserver: null,
      scale: 1,
      failedLogo: ''
    }
  },
  computed: {
    ...mapGetters(['publicSettings', 'currentUser']),
    organizationName() {
      return typeof this.snapshot?.organization === 'string'
        ? this.snapshot.organization
        : this.snapshot?.organization?.name || '—'
    },
    period() {
      return `${this.snapshot?.range?.start || '—'} — ${this.snapshot?.range?.end || '—'}`
    },
    logo() {
      const source = this.snapshot?.branding?.logo ?? this.publicSettings.INTERFACE?.logo_index
      if (!source || source === this.failedLogo || isDefaultInterfaceLogo(source)) {
        return defaultLogo
      }
      return source
    },
    watermark() {
      const settings = this.publicSettings || {}
      const fixed = this.snapshot?.branding?.watermark
      if (fixed?.content) return fixed
      const user = this.currentUser || {}
      const fields = {
        userId: user.id || '',
        name: user.name || '',
        userName: user.username || '',
        currentTime: this.formatDateTime(this.snapshot?.generated_at)
      }
      const content = (settings.SECURITY_WATERMARK_CONSOLE_CONTENT || '')
        .replace(/\$\{([^}]+)}/g, (_, key) => fields[key.trim()] ?? 'N/A')
        .trim()
      return {
        content:
          content ||
          `${this.organizationName}\n${this.$t('AuditReportDocWatermark')}\n${user.username || ''}`,
        color: settings.SECURITY_WATERMARK_COLOR,
        font_size: settings.SECURITY_WATERMARK_FONT_SIZE,
        width: settings.SECURITY_WATERMARK_WIDTH,
        height: settings.SECURITY_WATERMARK_HEIGHT,
        rotate: settings.SECURITY_WATERMARK_ROTATE
      }
    },
    watermarkStyle() {
      const tile = createReportWatermark(this.watermark)
      return {
        backgroundImage: `url("${tile.url}")`,
        backgroundSize: `${tile.width}px ${tile.height}px`
      }
    },
    sections() {
      const items = [...(this.snapshot?.sections || [])]
      const order = Array.isArray(this.config.chapters)
        ? this.config.chapters
        : items.map((item) => item.key)
      if (order.includes('conclusion') && !items.some((item) => item.key === 'conclusion')) {
        items.push({ key: 'conclusion', title: this.$t('AuditReportDocConclusion') })
      }
      return order.map((key) => items.find((item) => item.key === key)).filter(Boolean)
    },
    conclusions() {
      const manual = this.config.conclusion?.trim()
      const paragraphs = manual
        ? manual.split(/\n+/).filter(Boolean)
        : this.snapshot?.conclusions || []
      return paragraphs.length ? paragraphs : [this.$t('AuditReportDocNoConclusion')]
    },
    coverageNotes() {
      const coverage = this.snapshot?.coverage || {}
      const notes = [...(coverage.notes || [])]
      for (const source of coverage.sources || []) {
        // Routine metric definitions already appear in their report sections.
        // Keep the opening scope concise while retaining actual coverage warnings.
        if (source.status === 'available' && !source.retention_warning) continue
        for (const note of source.notes || []) {
          notes.push(`${source.label || source.key}：${note}`)
        }
        if (!source.notes?.length) {
          const message = ['unavailable', 'permission_denied'].includes(source.status)
            ? 'AuditReportDocUnavailable'
            : 'AuditReportDocPartial'
          notes.push(`${source.label || source.key}：${this.$t(message)}`)
        }
      }
      return [...new Set(notes.filter(Boolean))]
    },
    incomplete() {
      const status = this.snapshot?.coverage?.status
      return status && !['available', 'complete'].includes(status)
    }
  },
  watch: {
    snapshot: { deep: true, handler: 'scheduleLayout' },
    config: { deep: true, handler: 'scheduleLayout' },
    logo: 'scheduleLayout',
    watermark: { deep: true, handler: 'scheduleLayout' },
    '$i18n.locale': 'scheduleLayout'
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(() => this.resizePages())
    this.resizeObserver.observe(this.$el)
    this.scheduleLayout()
  },
  beforeUnmount() {
    this.layoutVersion++
    this.resizeObserver?.disconnect()
  },
  methods: {
    metricValue(value) {
      return value == null
        ? '—'
        : typeof value === 'number'
          ? value.toLocaleString()
          : String(value)
    },
    metricGroups(metrics = []) {
      return Array.from({ length: Math.ceil(metrics.length / 3) }, (_, index) =>
        metrics.slice(index * 3, index * 3 + 3)
      )
    },
    cellValue(value) {
      if (value == null) return '—'
      if (typeof value === 'boolean') return this.$t(value ? 'Yes' : 'No')
      if (Array.isArray(value)) return value.map(this.cellValue).join(', ')
      if (typeof value === 'object') return value.label || value.name || JSON.stringify(value)
      return String(value)
    },
    formatDateTime(value) {
      if (!value) return '—'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return date.toLocaleString(undefined, {
        timeZone: this.snapshot?.range?.timezone || undefined,
        hour12: false
      })
    },
    tableSummary(table) {
      const shown = table.rows?.length || 0
      const total = table.total == null ? '—' : this.metricValue(table.total)
      return this.$t(
        table.truncated || (table.total != null && table.total > shown)
          ? 'AuditReportDocSample'
          : 'AuditReportDocTotal',
        { shown, total }
      )
    },
    useDefaultLogo(event) {
      if (event.target.src === defaultLogo) return
      this.failedLogo = this.snapshot?.branding?.logo ?? this.publicSettings.INTERFACE?.logo_index
    },
    showPage(page) {
      this.currentPage = Math.max(1, Math.min(this.pageCount, page))
      Array.from(this.$refs.pages?.children || []).forEach((shell, index) => {
        shell.hidden = index + 1 !== this.currentPage
      })
      if (this.$refs.viewport) this.$refs.viewport.scrollTop = 0
    },
    resizePages() {
      const viewport = this.$refs.viewport
      if (!viewport) return
      this.scale = Math.min(1, Math.max(0.2, (viewport.clientWidth - 24) / REPORT_PAGE_WIDTH))
      for (const shell of this.$refs.pages?.children || []) {
        shell.style.width = `${REPORT_PAGE_WIDTH * this.scale}px`
        shell.style.height = `${REPORT_PAGE_HEIGHT * this.scale}px`
        shell.firstElementChild.style.transform = `scale(${this.scale})`
      }
    },
    scheduleLayout() {
      const version = ++this.layoutVersion
      this.preparing = true
      this.layoutPromise = this.$nextTick().then(async () => {
        await document.fonts?.ready
        if (version !== this.layoutVersion || !this.$refs.source) return
        try {
          this.layoutError = ''
          this.paginate()
        } catch (error) {
          this.layoutError = this.$t('AuditReportDocLayoutFailed')
          this.pageCount = 0
          this.$refs.pages?.replaceChildren()
        } finally {
          if (version === this.layoutVersion) this.preparing = false
        }
      })
    },
    async ready() {
      let pending
      do {
        pending = this.layoutPromise
        await pending
      } while (pending !== this.layoutPromise)
      if (!this.pageCount || this.layoutError) {
        throw new Error(this.$t('AuditReportDocExportUnavailable'))
      }
    },
    async exportPdf(options = {}) {
      await this.ready()
      return exportReportPages(this.$refs.pages.querySelectorAll('.rd-page'), {
        ...options,
        title: this.config.title,
        author: this.snapshot?.branding?.generated_by,
        watermark: this.watermark
      })
    },
    paginate() {
      const source = this.$refs.source
      const template = source.querySelector('.rd-page-template')
      const blocks = [...source.querySelector('.rd-source-blocks').children]
      const stage = document.createElement('div')
      source.appendChild(stage)
      const shells = []
      let page
      let body
      const newPage = () => {
        const shell = document.createElement('div')
        page = template.cloneNode(true)
        page.classList.remove('rd-page-template')
        page.style.transform = 'none'
        body = page.querySelector('.rd-page-body')
        shell.appendChild(page)
        stage.appendChild(shell)
        shells.push(shell)
      }
      const fits = () => body.scrollHeight <= body.clientHeight + 1
      const hasContent = () => body.childElementCount > 0
      const append = (node) => {
        body.appendChild(node)
        if (fits()) return true
        node.remove()
        return false
      }
      const appendText = (original) => {
        const characters = Array.from(original.textContent)
        let offset = 0
        while (offset < characters.length) {
          const node = original.cloneNode(false)
          node.textContent = characters.slice(offset).join('')
          if (append(node)) return
          let low = 1
          let high = characters.length - offset
          let best = 0
          while (low <= high) {
            const middle = Math.floor((low + high) / 2)
            node.textContent = characters.slice(offset, offset + middle).join('')
            body.appendChild(node)
            const valid = fits()
            node.remove()
            if (valid) {
              best = middle
              low = middle + 1
            } else high = middle - 1
          }
          if (!best) {
            if (!hasContent()) throw new Error('A report paragraph cannot fit on a page')
            newPage()
            continue
          }
          node.textContent = characters.slice(offset, offset + best).join('')
          body.appendChild(node)
          offset += best
          if (offset < characters.length) newPage()
        }
      }
      const appendTable = (original) => {
        const rows = [...original.querySelector('tbody').children]
        let fragment
        let tbody
        let tableContinued = false
        const startFragment = (continued) => {
          fragment = original.cloneNode(true)
          tbody = fragment.querySelector('tbody')
          tbody.replaceChildren()
          fragment.querySelector('.rd-table-total')?.remove()
          if (continued) {
            const title = fragment.querySelector('h3')
            if (title) title.textContent += ` ${this.$t('AuditReportDocContinued')}`
          }
          body.appendChild(fragment)
        }
        startFragment(false)
        for (const originalRow of rows) {
          let row = originalRow.cloneNode(true)
          tbody.appendChild(row)
          if (fits()) continue
          row.remove()
          const previousRows = tbody.childElementCount
          if (!previousRows) fragment.remove()
          if (previousRows) tableContinued = true
          if (hasContent()) newPage()
          startFragment(tableContinued)
          tbody.appendChild(row)
          if (fits()) continue
          // A single unusually long command or resource name may exceed a page.
          // Split cell text into continuation rows without discarding any characters.
          row.remove()
          const cells = [...originalRow.children]
          const remaining = cells.map((cell) => Array.from(cell.textContent))
          let continuation = false
          while (remaining.some((value) => value.length)) {
            let low = 1
            let high = Math.max(...remaining.map((value) => value.length))
            let best = 0
            while (low <= high) {
              const count = Math.floor((low + high) / 2)
              row = originalRow.cloneNode(false)
              cells.forEach((cell, index) => {
                const next = cell.cloneNode(false)
                next.textContent =
                  remaining[index].slice(0, count).join('') ||
                  (continuation && index === 0 && cell.textContent.length <= 80
                    ? `${cell.textContent} ${this.$t('AuditReportDocContinued')}`
                    : '')
                row.appendChild(next)
              })
              tbody.appendChild(row)
              const valid = fits()
              row.remove()
              if (valid) {
                best = count
                low = count + 1
              } else high = count - 1
            }
            if (!best) throw new Error('A report table row cannot fit on a page')
            row = originalRow.cloneNode(false)
            cells.forEach((cell, index) => {
              const next = cell.cloneNode(false)
              next.textContent =
                remaining[index].splice(0, best).join('') ||
                (continuation && index === 0 && cell.textContent.length <= 80
                  ? `${cell.textContent} ${this.$t('AuditReportDocContinued')}`
                  : '')
              row.appendChild(next)
            })
            row.setAttribute('title', this.$t('AuditReportDocLongRow'))
            if (continuation) row.setAttribute('data-report-row-continued', '')
            tbody.appendChild(row)
            if (remaining.some((value) => value.length)) {
              newPage()
              startFragment(true)
              continuation = true
            }
          }
        }
        const total = original.querySelector('.rd-table-total')
        if (total) {
          const note = total.cloneNode(true)
          if (!append(note)) {
            newPage()
            appendText(note)
          }
        }
      }
      try {
        newPage()
        for (let index = 0; index < blocks.length; index++) {
          const original = blocks[index]
          const node = original.cloneNode(true)
          if (original.hasAttribute('data-keep-next') && hasContent()) {
            const next = blocks[index + 1]?.cloneNode(true)
            body.appendChild(node)
            if (next) body.appendChild(next)
            const valid = fits()
            node.remove()
            next?.remove()
            if (!valid) newPage()
          }
          if (append(node)) continue
          if (original.getAttribute('data-report-block') === 'table') {
            appendTable(original)
            continue
          }
          if (hasContent()) newPage()
          if (append(node)) continue
          // Metric groups are bounded to three items; only free text can exceed a page.
          appendText(original)
        }
        shells.forEach((shell, index) => {
          const number = shell.querySelector('[data-report-page-number]')
          number.textContent = this.$t('AuditReportDocPage', {
            current: index + 1,
            total: shells.length
          })
        })
        this.$refs.pages.replaceChildren(...shells)
        this.pageCount = shells.length
        this.resizePages()
        this.showPage(this.currentPage)
      } finally {
        stage.remove()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.audit-report-document {
  min-width: 0;
}
.rd-empty {
  padding: 64px 24px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
.rd-pager {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.rd-viewport {
  overflow: auto;
  padding: 12px;
  min-height: 280px;
  background: #eef0f3;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.rd-pages {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.rd-source {
  position: fixed;
  left: -100000px;
  top: 0;
  width: 794px;
  visibility: hidden;
  pointer-events: none;
}
.rd-source-blocks {
  width: 698px;
}
.rd-page {
  width: 794px;
  height: 1123px;
  box-sizing: border-box;
  position: relative;
  color: #24303f;
  background: #fff;
  font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 12px;
  line-height: 1.6;
  transform-origin: top left;
  box-shadow: 0 2px 12px #24303f12;
  overflow: hidden;
  color-scheme: light;
}
.rd-page-header {
  position: absolute;
  top: 30px;
  left: 48px;
  right: 48px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 2px solid #17965e;
  padding-bottom: 12px;
  box-sizing: border-box;
}
.rd-logo {
  width: 118px;
  height: 28px;
  object-fit: contain;
  object-position: left center;
}
.rd-header-text {
  color: #66717f;
  flex: 1;
  text-align: right;
  font-size: 11px;
  overflow: hidden;
  max-height: 34px;
  overflow-wrap: anywhere;
}
.rd-page-body {
  position: absolute;
  top: 91px;
  bottom: 77px;
  left: 48px;
  right: 48px;
  overflow: hidden;
}
.rd-page-footer {
  position: absolute;
  bottom: 30px;
  left: 48px;
  right: 48px;
  height: 27px;
  border-top: 1px solid #dfe4e9;
  padding-top: 9px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: #7b8592;
  font-size: 10px;
  line-height: 1.4;
}
.rd-page-footer span:first-child {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.rd-page-footer span:last-child {
  flex-shrink: 0;
}
.rd-watermark {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}
.rd-intro {
  padding: 2px 0 18px;
  border-bottom: 1px solid #dfe4e9;
  margin-bottom: 20px;
}
.rd-document-kicker {
  color: #16965d;
  font-size: 11px;
  letter-spacing: 2px;
}
.rd-page h1,
.rd-source-blocks h1 {
  margin: 9px 0 18px;
  font-size: 25px;
  line-height: 1.4;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.rd-page h2,
.rd-source-blocks h2 {
  margin: 22px 0 10px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  border-left: 3px solid #16965d;
  padding-left: 10px;
  overflow-wrap: anywhere;
}
.rd-page h2:first-child {
  margin-top: 0;
}
.rd-page h3,
.rd-source-blocks h3 {
  font-size: 12px;
  font-weight: 600;
  margin: 13px 0 7px;
  line-height: 1.5;
}
.rd-intro dl {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 22px;
  font-size: 11px;
}
.rd-intro dl div {
  display: flex;
  gap: 8px;
  min-width: 0;
}
.rd-intro dt {
  color: #77818c;
  flex-shrink: 0;
  width: 62px;
}
.rd-intro dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.rd-page p,
.rd-source-blocks p {
  margin: 0 0 9px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.rd-note {
  font-size: 10px;
  line-height: 1.65;
  color: #697483;
}
.rd-description {
  font-size: 11px;
  color: #697483;
}
.rd-status {
  border-radius: 3px;
  padding: 8px 10px;
  font-size: 11px;
}
.rd-status-warning {
  background: #fff7e6;
  color: #945d0d;
}
.rd-status-error {
  background: #fff0ee;
  color: #b94940;
}
.rd-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 12px 0;
}
.rd-metric {
  min-width: 0;
  background: #f6f8fa;
  border: 1px solid #e5e9ee;
  border-radius: 3px;
  padding: 10px 12px;
}
.rd-metric-label {
  font-size: 10px;
  color: #66717f;
}
.rd-metric-value {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.6;
  color: #263746;
  overflow-wrap: anywhere;
}
.rd-metric-value small {
  font-size: 10px;
  font-weight: 400;
  margin-left: 5px;
}
.rd-metric-help {
  font-size: 9px;
  color: #697483;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.rd-table-block {
  margin: 12px 0 10px;
}
.rd-page table,
.rd-source-blocks table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 10px;
  line-height: 1.55;
}
.rd-page th,
.rd-page td,
.rd-source-blocks th,
.rd-source-blocks td {
  text-align: left;
  padding: 7px 8px;
  border: 1px solid #e0e5eb;
  vertical-align: top;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  font-weight: 400;
}
.rd-page th,
.rd-source-blocks th {
  background: #f1f5f7;
  color: #4a5969;
  font-weight: 600;
}
.rd-page tr:nth-child(even) td,
.rd-source-blocks tr:nth-child(even) td {
  background: #fafbfc;
}
.rd-table-total {
  margin-top: 6px !important;
}
.rd-no-rows {
  color: #78828e;
  text-align: center !important;
  padding: 15px !important;
}
.rd-conclusion {
  font-size: 12px;
  line-height: 1.85;
}
@media (max-width: 520px) {
  .rd-pager {
    gap: 8px;
    flex-wrap: wrap;
  }
  .rd-viewport {
    padding: 8px;
  }
}
</style>
