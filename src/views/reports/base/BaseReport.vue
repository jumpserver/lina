<template>
  <div :class="{ 'no-nav': onlyCharts }">
    <div v-if="!onlyCharts" class="header nav-bar">
      <div class="nav-bar-logo">
        <Logo />
      </div>
      <div class="nav-bar-right export-bar">
        <el-button-group>
          <el-button class="export-btn" type="text" icon="el-icon-printer" @click="exportPDF">
            Export as PDF
          </el-button>
          <el-button class="export-btn" type="text" icon="el-icon-message" @click="emailReport">
            E-Mail this Report
          </el-button>
          <el-button class="export-btn" type="text" icon="el-icon-printer" @click="printReport">
            Print
          </el-button>
          <el-button class="export-btn" type="text" icon="el-icon-setting" @click="openSettings">
            Settings
          </el-button>
        </el-button-group>
      </div>
    </div>
    <div class="content">
      <div v-if="!onlyCharts">
        <div class="title">
          {{ title }}

          <span class="datetime">
            [{{ new Date().toLocaleString() }}]
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

export default {
  components: {
    Logo
  },
  props: {
    onlyCharts: {
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

    .export-bar {
      padding: 0 16px;
      border-radius: 0 0 4px 4px;
      display: flex;
      align-items: center;
      height: 40px;
    }

    .export-btn {
      background: transparent;
      color: #fff;
      border: none;
      font-weight: 500;
      font-size: 14px;
      margin: 0 2px;

      &.el-button--text {
        color: #fff;
      }

      & + span {
        color: #fff;
        margin-left: 2px;
      }
    }
    .export-btn .el-icon-document,
    .export-btn .el-icon-printer,
    .export-btn .el-icon-message {
      margin-right: 4px;
    }
    .el-button-group {
      background: transparent;
      box-shadow: none;
    }
    .export-btn:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
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
  }

  .no-nav {
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
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

