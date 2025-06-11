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
          <el-button class="export-btn" type="text" icon="el-icon-setting" @click="openSettings">
            Settings
          </el-button>
        </el-button-group>
      </div>
    </div>
    <div class="content">
      <div class="title">
        {{ title }}

        <span class="datetime">
          [{{ new Date().toLocaleString() }}]
        </span>
      </div>
      <div class="description">
        {{ description }}
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

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
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
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }

  .charts-zone {
    padding: 16px 30px;
    margin: 0 auto;
    width: 1046px;

    ::v-deep {
      .full-width-chart {
         width: 100%;
         margin-bottom: 32px;

         .chart-container-title {
           margin-bottom: 0;
         }
         .chart {
           width: 100%;
           height: 350px;
         }
       }

       .charts-grid {
         display: grid;
         grid-template-columns: repeat(2, 1fr);
         gap: 16px;
         max-width: 1600px;
         margin: 0 auto;
       }

       .full-width {
         grid-column: 1 / -1;
       }

       @media (max-width: 767px) {
         .charts-grid {
           grid-template-columns: 1fr;
         }
         .full-width {
           grid-column: 1 / -1;
         }
       }
    }
  }

</style>

