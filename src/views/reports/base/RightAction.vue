<template>
  <div class="nav-bar-right export-bar">
    <el-button-group>
      <el-button
        :loading="exportLoading"
        :disabled="exportLoading"
        class="export-btn"
        type="text"
        icon="el-icon-printer"
        @click="exportPdf"
      >
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
</template>

<script>
import { download } from '@/utils/common'

export default {
  name: 'RightAction',
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      exportLoading: false
    }
  },
  methods: {
    exportPdf() {
      if (!this.name) {
        this.$message.error('Please select a chart')
        return
      }

      const exportUrl = `/core/reports/export-pdf/?chart=${this.name}`
      download(exportUrl)
      this.$message.success('Exporting...')
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
<style scoped lang="scss">
.export-bar {
  padding: 0 16px;
  border-radius: 0 0 4px 4px;
  display: flex;
  align-items: center;
  height: 40px;

  .export-btn {
    background: transparent;
    color: #fff;
    border: none;
    font-weight: 500;
    font-size: 14px;
    margin: 0 2px;
    padding: 8px;

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
</style>
