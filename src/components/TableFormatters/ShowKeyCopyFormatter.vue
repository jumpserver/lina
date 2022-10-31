<template>
  <div class="content">
    <span>{{ currentValue }}</span>
    <span class="right">
      <el-tooltip
        v-if="hasShow"
        effect="dark"
        placement="top"
        :content="this.$t('common.View')"
      >
        <i class="el-icon-view" @click="onShow()" />
      </el-tooltip>
      <el-tooltip
        v-if="hasCopy"
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
export default {
  name: 'ShowKeyCopyFormatter',
  props: {
    value: {
      type: String,
      default: () => ''
    },
    cellValue: {
      type: [String, Number],
      default: ''
    },
    hasShow: {
      type: Boolean,
      default: true
    },
    hasCopy: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentValue: this.switchShowValue()
    }
  },
  computed: {
    iValue() {
      return this.value || this.cellValue
    }
  },
  methods: {
    switchShowValue() {
      const value = this.value || this.cellValue
      return value ? '******' + value.replace(/[\s\S]/g, '') : ''
    },
    onShow() {
      const { currentValue, switchShowValue } = this
      this.currentValue = currentValue === this.iValue ? switchShowValue() : this.iValue
    },
    onCopy: _.throttle(function() {
      const inputDom = document.createElement('input')
      inputDom.id = 'createInputDom'
      inputDom.value = this.iValue
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
          color: var(--color-primary);
        }
      }
    }
  }
</style>
