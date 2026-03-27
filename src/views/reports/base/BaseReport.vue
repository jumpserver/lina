<template>
  <div :class="{ 'only-charts': onlyCharts, 'nav': nav }">
    <div v-if="!onlyCharts && nav" class="header nav-bar">
      <div class="nav-bar-logo">
        <Logo />
      </div>
      <RightAction
        :name="name"
        :title="title"
        :show-operation-dropdown="!isCustomReportPage"
        :force-default-actions="nav && isCustomReportPage"
      />
    </div>
    <div class="content">
      <div v-if="!onlyCharts" class="title-bar">
        <div class="title-left">
          <div class="title">
            {{ title }}

            <span class="datetime">
              [{{ new Date().toLocaleString() }}]
            </span>
          </div>
          <div v-if="customizeMode" class="report-visibility-panel">
            <div class="report-visibility-row">
              <el-checkbox :value="isDisplayModeEnabled('chart')" @change="handleModeToggle('chart', $event)">
                {{ $t('ChartReport') }}
              </el-checkbox>
              <el-checkbox-group
                v-if="chartOptions.length && isDisplayModeEnabled('chart')"
                class="report-visibility-children"
                size="mini"
                :value="selectedChartNames"
                @input="handleChartSelectionChange"
              >
                <el-checkbox v-for="item in chartOptions" :key="item.name" :label="item.name">
                  {{ item.title }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="report-visibility-row">
              <el-checkbox :value="isDisplayModeEnabled('table')" @change="handleModeToggle('table', $event)">
                {{ $t('TableDetails') }}
              </el-checkbox>
              <el-checkbox-group
                v-if="tableOptions.length && isDisplayModeEnabled('table')"
                class="report-visibility-children"
                size="mini"
                :value="selectedTableNames"
                @input="handleTableSelectionChange"
              >
                <el-checkbox v-for="item in tableOptions" :key="item.name" :label="item.name">
                  {{ item.title }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
          <div v-if="isDescription" class="description">
            {{ description }}
          </div>
        </div>
        <div v-if="!nav" class="title-right">
          <RightAction
            :name="name"
            :title="title"
            :editor-only="true"
            :show-editor-button="false"
            :show-custom-actions-in-editor="isCustomReportPage"
            :show-operation-only-in-editor="true"
          />
          <span v-if="url && showReportExportBtn" class="export-btn inline-export-btn">
            <el-button type="text" @click="openNewWindow">
              <i class="fa fa-external-link" style="font-size: 15px;" />
              {{ $t('Customize') }}
            </el-button>
          </span>
        </div>
      </div>
      <div class="charts-zone" :class="{ 'charts-zone--no-padding': disableChartsPadding }">
        <slot v-if="isDisplayModeEnabled('chart')" name="default" />
        <div style="margin-top: 15px" />
        <slot v-if="isDisplayModeEnabled('table')" name="table" />
      </div>
    </div>
  </div>
</template>

<script>
import Logo from '@/layout/components/NavLeft/Logo'
import RightAction from './RightAction.vue'
import store from '@/store'
import { appendQuery, pickReportQuery } from './reportUtils'

export default {
  components: {
    Logo,
    RightAction
  },
  props: {
    onlyCharts: {
      type: Boolean,
      default: false
    },
    nav: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    disableChartsPadding: {
      type: Boolean,
      default: false
    },
    showDisplayModeToggle: {
      type: Boolean,
      default: true
    },
    displayMode: {
      type: [String, Array],
      default: () => {
        return ['chart', 'table']
      }
    },
    charts: {
      type: Array,
      default: () => []
    },
    tables: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedChartNames: [],
      selectedTableNames: [],
      visibilityObserver: null
    }
  },
  computed: {
    isDescription() {
      return this.description && this.description.trim() !== ''
    },
    isCustomReportPage() {
      const query = (this.$route && this.$route.query) || {}
      const v = query.report_id
      const reportId = Array.isArray(v) ? v[0] : v
      return !!reportId
    },
    selectedDisplayModes() {
      const modes = Array.isArray(this.displayMode)
        ? this.displayMode
        : [this.displayMode]
      const normalized = modes.filter(mode => mode === 'chart' || mode === 'table')
      return normalized.length ? normalized : ['chart', 'table']
    },
    chartOptions() {
      return this.normalizeOptions(this.charts)
    },
    tableOptions() {
      return this.normalizeOptions(this.tables)
    },
    showReportExportBtn() {
      return store.getters.hasValidLicense
    },
    customizeMode() {
      const query = (this.$route && this.$route.query) || {}
      const rawCustomizeMode = query.customize
      const customizeMode = Array.isArray(rawCustomizeMode) ? rawCustomizeMode[0] : rawCustomizeMode
      return String(customizeMode) === '1'
    }
  },
  watch: {
    charts: {
      immediate: true,
      handler() {
        this.syncSelectionsFromRoute()
      }
    },
    tables: {
      immediate: true,
      handler() {
        this.syncSelectionsFromRoute()
      }
    },
    '$route.query': {
      deep: false,
      handler() {
        this.syncSelectionsFromRoute()
        this.$nextTick(() => this.applyItemVisibility())
      }
    }
  },
  mounted() {
    this.setupVisibilityObserver()
    this.$nextTick(() => this.applyItemVisibility())
  },
  beforeDestroy() {
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect()
      this.visibilityObserver = null
    }
  },
  methods: {
    handleChangeChart(event) {
      // console.log(event)
    },
    isDisplayModeEnabled(mode) {
      return this.selectedDisplayModes.includes(mode)
    },
    normalizeOptions(items) {
      if (!Array.isArray(items)) return []
      return items
        .filter(item => item && typeof item.name === 'string' && item.name.trim() !== '')
        .map(item => ({
          name: item.name,
          title: String(item.title || item.name)
        }))
    },
    getDefaultSelectedNames(current, options) {
      const optionNames = options.map(item => item.name)
      const selected = Array.isArray(current) ? current.filter(name => optionNames.includes(name)) : []
      return selected.length ? selected : optionNames
    },
    parseQuerySelection(key, options) {
      const optionNames = options.map(item => item.name)
      if (!optionNames.length) return []
      const routeQueryValue = this.$route && this.$route.query ? this.$route.query[key] : undefined
      const hashQueryValue = this.getHashQueryValue(key)
      const queryValue = routeQueryValue !== undefined ? routeQueryValue : hashQueryValue
      if (queryValue === undefined || queryValue === null || queryValue === '') return null
      const rawList = Array.isArray(queryValue) ? queryValue : String(queryValue).split(',')
      const selected = Array.from(new Set(rawList.map(v => String(v).trim()).filter(v => optionNames.includes(v))))
      return selected.length ? selected : optionNames
    },
    getHashQueryValue(key) {
      if (typeof window === 'undefined' || !window.location) return undefined
      const hash = window.location.hash || ''
      const hashWithoutPrefix = hash.startsWith('#') ? hash.slice(1) : hash
      const queryStartIndex = hashWithoutPrefix.indexOf('?')
      if (queryStartIndex < 0) return undefined
      const hashQuery = hashWithoutPrefix.slice(queryStartIndex + 1)
      const params = new URLSearchParams(hashQuery)
      const values = params.getAll(key)
      if (!values.length) return undefined
      return values.length > 1 ? values : values[0]
    },
    syncSelectionsFromRoute() {
      const chartSelectionFromQuery = this.parseQuerySelection('visible_charts', this.chartOptions)
      const tableSelectionFromQuery = this.parseQuerySelection('visible_tables', this.tableOptions)
      this.selectedChartNames = chartSelectionFromQuery || this.getDefaultSelectedNames(this.selectedChartNames, this.chartOptions)
      this.selectedTableNames = tableSelectionFromQuery || this.getDefaultSelectedNames(this.selectedTableNames, this.tableOptions)
      this.$nextTick(() => this.applyItemVisibility())
    },
    updateVisibilityQuery() {
      if (typeof window === 'undefined' || !window.history || !window.location) return
      const pathSearch = new URLSearchParams(window.location.search)
      pathSearch.delete('visible_charts')
      pathSearch.delete('visible_tables')
      const pathQueryString = pathSearch.toString()
      const hash = window.location.hash || '#'
      const hashWithoutPrefix = hash.startsWith('#') ? hash.slice(1) : hash
      const queryStartIndex = hashWithoutPrefix.indexOf('?')
      const hashPath = queryStartIndex >= 0 ? hashWithoutPrefix.slice(0, queryStartIndex) : hashWithoutPrefix
      const hashSearch = new URLSearchParams(queryStartIndex >= 0 ? hashWithoutPrefix.slice(queryStartIndex + 1) : '')
      const chartAllSelected = this.chartOptions.length && this.selectedChartNames.length === this.chartOptions.length
      const tableAllSelected = this.tableOptions.length && this.selectedTableNames.length === this.tableOptions.length
      if (this.chartOptions.length && !chartAllSelected) hashSearch.set('visible_charts', this.selectedChartNames.join(','))
      else hashSearch.delete('visible_charts')
      if (this.tableOptions.length && !tableAllSelected) hashSearch.set('visible_tables', this.selectedTableNames.join(','))
      else hashSearch.delete('visible_tables')
      const hashQueryString = hashSearch.toString()
      const nextHash = `#${hashPath}${hashQueryString ? `?${hashQueryString}` : ''}`
      const nextUrl = `${window.location.pathname}${pathQueryString ? `?${pathQueryString}` : ''}${nextHash}`
      window.history.replaceState(window.history.state, '', nextUrl)
    },
    handleDisplayModeChange(modes) {
      const normalized = Array.isArray(modes)
        ? Array.from(new Set(modes.filter(mode => mode === 'chart' || mode === 'table')))
        : []
      if (!normalized.length) {
        return
      }
      this.$emit('update:displayMode', normalized)
    },
    handleModeToggle(mode, checked) {
      const nextModes = [...this.selectedDisplayModes]
      const idx = nextModes.indexOf(mode)
      if (checked && idx < 0) nextModes.push(mode)
      if (!checked && idx >= 0) nextModes.splice(idx, 1)
      if (!nextModes.length) return
      this.handleDisplayModeChange(nextModes)
    },
    handleChartSelectionChange(names) {
      const normalized = Array.isArray(names)
        ? names.filter(name => this.chartOptions.some(item => item.name === name))
        : []
      if (!normalized.length && this.chartOptions.length) return
      this.selectedChartNames = normalized
      this.updateVisibilityQuery()
      this.$nextTick(() => this.applyItemVisibility())
    },
    handleTableSelectionChange(names) {
      const normalized = Array.isArray(names)
        ? names.filter(name => this.tableOptions.some(item => item.name === name))
        : []
      if (!normalized.length && this.tableOptions.length) return
      this.selectedTableNames = normalized
      this.updateVisibilityQuery()
      this.$nextTick(() => this.applyItemVisibility())
    },
    isItemSelected(type, rawName) {
      if (!rawName) return true
      const name = String(rawName).trim()
      if (!name) return true
      const options = type === 'chart' ? this.chartOptions : this.tableOptions
      const selected = type === 'chart' ? this.selectedChartNames : this.selectedTableNames
      if (!options.length || !selected.length) return true
      const matchedByName = options.find(item => item.name === name)
      if (matchedByName) return selected.includes(matchedByName.name)
      const matchedByTitle = options.find(item => item.title === name)
      if (matchedByTitle) return selected.includes(matchedByTitle.name)
      return true
    },
    applyItemVisibility() {
      if (!this.$el) return
      const nodes = this.$el.querySelectorAll('[data-report-type][data-report-name]')
      nodes.forEach((node) => {
        const type = node.getAttribute('data-report-type')
        const name = node.getAttribute('data-report-name')
        const isVisible = this.isItemSelected(type, name)
        node.classList.toggle('report-item-hidden', !isVisible)
      })
    },
    setupVisibilityObserver() {
      if (typeof MutationObserver === 'undefined' || !this.$el) return
      const zone = this.$el.querySelector('.charts-zone')
      if (!zone) return
      this.visibilityObserver = new MutationObserver(() => {
        this.applyItemVisibility()
      })
      this.visibilityObserver.observe(zone, {
        childList: true,
        subtree: true
      })
    },
    openNewWindow() {
      try {
        if (!this.win || this.win.closed) {
          // 计算窗口居中位置
          const width = 1024
          const height = 800
          const left = (screen.width - width) / 2
          const top = (screen.height - height) / 2
          const options = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
          const query = pickReportQuery(this.$route.query)
          const url = appendQuery(this.url, {
            ...query,
            days: this.$route.query.days,
            customize: 1
          })
          this.win = window.open(url, '_blank', options)
        }
        // 确保窗口在最前面
        this.win.focus()
      } catch (error) {
        console.error('打开新窗口失败:', error)
        // 降级处理：在当前窗口打开
        window.location.href = this.url
      }
    },
    openSettings() {
      console.log('openSettings')
    }
  }
}
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 270px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--banner-bg);
  padding: 16px;
  height: 40px;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 16px;
}

.title-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.title-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  min-height: 40px;
  background-color: white;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  padding: 6px 16px;
  border-radius: 4px;

  .datetime {
    font-size: 12px;
    color: #999;
  }
}

.report-visibility-panel {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 4px;
  background: #fff;
}

.report-visibility-row + .report-visibility-row {
  margin-top: 6px;
}

.report-visibility-children {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-left: 18px;
}

.description {
  font-size: 14px;
  color: #333;
  padding: 16px;
  background-color: white;
}

.export-btn {
  float: right;
  line-height: 40px;
  margin-right: 23px;
}

.title-right {
  .export-btn {
    float: none;
    line-height: 1;
    margin-right: 0;
  }
}

.inline-export-btn {
  margin-right: 0;
}

.content {
  // background-color: white;
  background-color: #F1F1F1;
  height: calc(100vh - 40px);
  overflow-y: auto;

  ::v-deep .export-bar {
    float: right;

    .export-btn.el-button--text {
      color: #333;
      border: none;
      font-weight: 500;
      font-size: 13px;
      margin-left: 16px;

      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.only-charts {
  .content {
    height: auto;
    overflow-y: hidden;
    overflow-x: hidden;

    .title-bar {
      margin: 0 30px;
    }

    .export-btn {
      position: absolute;
      top: 5px;
      right: 20px;
    }
  }

  .charts-zone {
    padding: 2px 0;
  }
}

.nav {
  .content {
    .charts-zone {
      width: 1000px;
    }
  }

  .title-bar {
    background-color: white;
    width: 100%;
  }
}

@page {
  size: A4 landscape;
}

@media print {
  .header {
    display: none;
  }

  .content {
    overflow-y: hidden;
    height: auto;
    background-color: white;
  }

  .charts-zone {

    ::v-deep {
      .chart-container {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .box-container {
        display: block !important;
      }
    }
  }
}

.charts-zone {
  padding: 16px 30px;
  margin: 0 auto;
  // width: 100%;
  // max-width: 1046px; 不能设置，因为 dashboard 中会引用
  box-sizing: border-box;
  min-height: 100px; // 添加最小高度确保容器始终存在

  ::v-deep {
    .full-width-chart {
      width: 100%;
      margin-bottom: 32px;
      position: relative; // 添加相对定位
    }

    .chart {
      height: 260px;
      position: relative; // 添加相对定位
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      width: 100%;
      margin: 0 auto;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .chart-container {
      background-color: white;
      border-radius: 4px;
      padding: 16px;
      // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      border: 1px solid var(--color-border);
      transition: all 0.3s ease;
      max-width: calc(50vw - 30px);
      min-width: 300px;

      &.full-width {
        max-width: calc(100vw - 60px);
      }

      &.transport-box {
        background: transparent;
      }
    }

    .chart-container-title {
      margin-bottom: 16px;
    }

    .chart-container-title-text {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }

    .report-toolbar-wrap {
      min-width: 0;
      max-width: calc(100vw - 60px);
      padding: 10px 12px;

      .report-toolbar {
        margin-bottom: 0;
      }
    }

    /* Tables rendered as cards */
    .report-tables {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .report-table-wrap {
      width: 100%;
    }

    .report-card {
      padding: 12px;
      box-sizing: border-box;
    }

    .report-card .chart-container-title {
      margin-bottom: 8px;
    }

    .report-card-body {
      padding-top: 6px;
    }

    // @media (max-width: 767px) {
    //   .charts-grid {
    //     grid-template-columns: 1fr;
    //   }
    //   .full-width {
    //     grid-column: 1 / -1;
    //   }
    // }
  }
}

@media (max-width: 1200px) {
  .title-bar {
    flex-direction: column;
    gap: 10px;
  }

  .title-right {
    width: 100%;
    justify-content: flex-end;
  }
}

.charts-zone--no-padding {
  padding: 0 !important;
}

.report-item-hidden {
  display: none !important;
}

</style>
