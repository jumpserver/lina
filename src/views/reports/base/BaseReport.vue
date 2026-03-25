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

            <el-button-group v-if="showDisplayModeToggle && !nav" class="display-mode-switch">
              <el-button :type="displayMode === 'chart' ? 'primary' : 'default'" size="mini" @click="$emit('update:displayMode', 'chart')">
                {{ $t('ChartReport') }}
              </el-button>
              <el-button :type="displayMode === 'table' ? 'primary' : 'default'" size="mini" @click="$emit('update:displayMode', 'table')">
                {{ $t('TableDetails') }}
              </el-button>
            </el-button-group>
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
            :show-editor-button="true"
            :show-custom-actions-in-editor="isCustomReportPage"
            :show-operation-only-in-editor="true"
          />
          <span v-if="url && showReportExportBtn" class="export-btn inline-export-btn">
            <el-button type="text" @click="openNewWindow">
              <i class="fa fa-external-link" style="font-size: 15px;" />
              {{ $t('Export') }}
            </el-button>
          </span>
        </div>
      </div>
      <div class="charts-zone" :class="{ 'charts-zone--no-padding': disableChartsPadding }">
        <slot />
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
      default: false
    },
    displayMode: {
      type: String,
      default: 'chart'
    }
  },
  data() {
    return {}
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
    showReportExportBtn() {
      return store.getters.hasValidLicense
    }
  },
  methods: {
    handleChangeChart(event) {
      // console.log(event)
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
            days: this.$route.query.days
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

.display-mode-switch {
  display: inline-flex;
  vertical-align: middle;

  ::v-deep .el-button {
    min-width: 88px;
    padding: 6px 10px;
  }
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

</style>