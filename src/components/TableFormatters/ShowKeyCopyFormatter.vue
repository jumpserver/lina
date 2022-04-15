<template>
  <div class="content">
    <span>{{ currentValue }}</span>
    <span class="right">
      <el-tooltip
        effect="dark"
        placement="top"
        :content="this.$t('common.View')"
      >
        <i class="el-icon-view" @click="onShow()" />
      </el-tooltip>
      <el-tooltip
        effect="dark"
        placement="top"
        :content="this.$t('common.Copy')"
      >
        <i class="el-icon-copy-document" @click="onCopy()" />
      </el-tooltip>
    </span>
  </div>
</template>

<script>
import BaseFormatter from './base'

export default {
  name: 'ShowKeyCopyFormatter',
  extends: BaseFormatter,
  proops: {
    cellValue: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      currentValue: this.switchShowValue()
    }
  },
  methods: {
    switchShowValue() {
      return '******' + this.cellValue.replace(/[\w-]/g, '')
    },
    onShow() {
      const { currentValue, cellValue, switchShowValue } = this
      this.currentValue = currentValue === cellValue ? switchShowValue() : cellValue
    },
    onCopy: _.throttle(function() {
      const inputDom = document.createElement('input')
      inputDom.id = 'creatInputDom'
      inputDom.value = this.cellValue
      document.body.appendChild(inputDom)
      inputDom.select()
      document?.execCommand('copy')
      this.$message({
        message: this.$t('common.CopySuccess'),
        type: 'success',
        duration: 1400
      })
      document.body.removeChild(inputDom)
    }, 1800)
  }
}
</script>
<style lang="scss" scoped>
  .content {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    .right {
      float: right;
      font-size: 15px;
      cursor: pointer;
      .el-icon-view, .el-icon-copy-document {
        &:hover {
          color: #1c84c6;
        }
      }
    }
  }
</style>
