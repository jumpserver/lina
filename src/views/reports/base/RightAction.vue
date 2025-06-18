<template>
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
</template>

<script>
export default {
  name: 'RightAction',
  methods: {
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
