<template>
  <div :class="{ 'no-padding': onlyCharts }">
    <div v-if="!onlyCharts && nav" class="header nav-bar">
      <div class="nav-bar-logo">
        <Logo />
      </div>
      <RightAction />
    </div>
    <div class="content">
      <div v-if="!onlyCharts" class="title-bar">
        <div class="title">
          {{ title }}

          <span class="datetime">
            [{{ new Date().toLocaleString() }}]
          </span>

          <span style="float: right; line-height: 40px;">
            <el-button type="text" @click="openNewWindow">
              <i class="fa fa-external-link" />
              New open
            </el-button>
          </span>
        </div>
        <div class="description">
          {{ description }}
        </div>
      </div>
      <div class="charts-zone">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import Logo from '@/layout/components/NavLeft/Logo'
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import RightAction from './RightAction.vue'

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
    }
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  beforeDestroy() {

  },
  methods: {
    handleChangeChart(event) {
      console.log(event)
    },
    openNewWindow() {
      const url = '/ui/#/reports/users/user-activity'
      try {
        if (!this.win || this.win.closed) {
          // 计算窗口居中位置
          const width = 1000
          const height = 800
          const left = (screen.width - width) / 2
          const top = (screen.height - height) / 2

          this.win = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`)
        }
        // 确保窗口在最前面
        this.win.focus()
        this.win.location.href = url
      } catch (error) {
        console.error('打开新窗口失败:', error)
        // 降级处理：在当前窗口打开
        window.location.href = url
      }
    },
    exportExcel() {
      console.log('exportExcel')
    },
    exportPDF() {
      console.log('exportPDF')
    },
    emailReport() {
      console.log('emailReport')
    },
    printReport() {
      window.print()
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
    height: 300px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--banner-bg);
    padding: 16px;
    height: 40px;
  }

  .title {
    height: 40px;
    background-color: white;
    line-height: 40px;
    font-size: 15px;
    font-weight: 500;
    color: #333;
    padding: 0 16px;

    .datetime {
      font-size: 12px;
      color: #999;
      margin-left: 16px;
    }
  }

  .description {
    font-size: 14px;
    color: #333;
    padding: 16px;
    background-color: white;
  }

  .content {
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

  .no-padding {
    .content {
      height: auto;
      overflow-y: hidden;
      overflow-x: hidden;
    }

    .charts-zone {
      padding: 0;
    }
  }

  @media print {
    .content {
        overflow-y: hidden;
        height: auto;
        background-color: white;
    }

    .charts-zone {
        width: 1046px;
    }
  }

  .charts-zone {
    padding: 16px 30px;
    margin: 0 auto;
    // width: 100%;
    // max-width: 1046px;
    box-sizing: border-box;
    min-height: 100px; // 添加最小高度确保容器始终存在

    ::v-deep {
      .full-width-chart {
        width: 100%;
        margin-bottom: 32px;
        position: relative; // 添加相对定位
      }

      .chart {
        height: 300px;
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

</style>

