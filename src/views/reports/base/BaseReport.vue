<template>
  <div>
    <div class="header nav-bar">
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
        </el-button-group>
      </div>
    </div>
    <div class="content">
      <div class="title">
        {{ title }}
      </div>
      <div class="description">
        {{ description }}
      </div>

      <div class="charts-grid">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import Logo from '@/layout/components/NavLeft/Logo'

export default {
  components: {
    Logo
  },
  props: {
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
    return {}
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
      console.log('printReport')
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
    height: 48px;

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
      font-size: 15px;
      margin: 0 2px;

      &.el-button--text {
        color: #fff;
      }

      span {
        color: #fff;
      }
    }
    .export-btn .el-icon-document,
    .export-btn .el-icon-printer,
    .export-btn .el-icon-message {
      margin-right: 4px;
    }
    .divider {
      width: 1px;
      height: 22px;
      background: rgba(255,255,255,0.5);
      margin: 0 8px;
      display: inline-block;
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
    height: 35px;
    background-color: white;
    line-height: 35px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    padding: 0 16px;
  }

  .description {
    font-size: 14px;
    color: #333;
    padding: 16px;
    background-color: white;
  }

  .content {
    background-color: #F1F1F1;
    min-height: calc(100vh - 48px);
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
    max-width: 1600px;
    margin: 0 auto;
  }

  .chart-container {
    background-color: white;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .chart-container-title {
    margin-bottom: 16px;
  }

  .chart-container-title-text {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }

  /* 大屏幕 (1600px 以上) */
  @media screen and (min-width: 1600px) {
    .charts-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      padding: 24px;
    }

    .echarts {
      height: 400px;
    }

    .chart-container {
      padding: 24px;
    }

    .chart-container-title-text {
      font-size: 18px;
    }
  }

  /* 中等屏幕 (1200px - 1599px) */
  @media screen and (max-width: 1599px) {
    .charts-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 16px;
    }

    .echarts {
      height: 300px;
    }
  }

  /* 平板 (768px - 1199px) */
  @media screen and (max-width: 1199px) {
    .charts-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 12px;
    }

    .echarts {
      height: 250px;
    }

    .chart-container {
      padding: 12px;
    }

    .chart-container-title-text {
      font-size: 15px;
    }
  }

  /* 手机 (768px 以下) */
  @media screen and (max-width: 767px) {
    .charts-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 12px;
    }

    .echarts {
      height: 250px;
    }

    .chart-container {
      padding: 12px;
    }

    .chart-container-title-text {
      font-size: 14px;
    }

    .description {
      font-size: 13px;
      padding: 12px;
    }

    .header {
      padding: 12px;
    }

    .nav-bar-right {
      .el-button {
        padding: 8px 12px;
        font-size: 12px;
      }
    }
  }

  /* 小屏手机 (480px 以下) */
  @media screen and (max-width: 480px) {
    .charts-grid {
      gap: 8px;
      padding: 8px;
    }

    .echarts {
      height: 200px;
    }

    .chart-container {
      padding: 8px;
    }

    .chart-container-title {
      margin-bottom: 8px;
    }

    .chart-container-title-text {
      font-size: 13px;
      margin-bottom: 4px;
    }

    .description {
      font-size: 12px;
      padding: 8px;
    }

    .header {
      padding: 8px;
      height: 40px;
    }

    .nav-bar-right {
      .el-button {
        padding: 6px 10px;
        font-size: 11px;
      }
    }
  }

</style>

