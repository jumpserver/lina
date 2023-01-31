<template>
  <div class="content">
    <pre class="text">{{ currentValue }}</pre>
    <span v-if="cellValue" class="action">
      <el-tooltip
        v-if="hasShow"
        effect="dark"
        placement="top"
        :content="$tc('common.View')"
      >
        <i class="fa" :class="isShow ? 'fa-eye-slash' : 'fa-eye'" @click="onShow()" />
      </el-tooltip>
      <el-tooltip
        v-if="hasDownload"
        effect="dark"
        placement="top"
        :content="$tc('common.Download')"
      >
        <i class="fa fa-download" @click="onDownload()" />
      </el-tooltip>
      <el-tooltip
        v-if="hasCopy"
        effect="dark"
        placement="top"
        :content="$tc('common.Copy')"
      >
        <i class="fa fa-clone" @click="onCopy()" />
      </el-tooltip>
    </span>
  </div>
</template>

<script>
import { downloadText } from '@/utils/common'
import BaseFormatter from '@/components/TableFormatters/base'

export default {
  name: 'ShowKeyCopyFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          name: 'key',
          hasShow: true,
          hasDownload: true,
          hasCopy: true,
          defaultShow: false
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs || {}),
      isShow: false
    }
  },
  computed: {
    hasShow: function() {
      return this.formatterArgs.hasShow
    },
    hasDownload: function() {
      return this.formatterArgs.hasDownload
    },
    hasCopy: function() {
      return this.formatterArgs.hasCopy
    },
    name: function() {
      return this.formatterArgs.name
    },
    currentValue() {
      if (this.isShow) {
        return this.cellValue || '-'
      } else {
        return this.cellValue ? '******' : '-'
      }
    }
  },
  mounted() {
    this.isShow = this.formatterArgs.defaultShow
  },
  methods: {
    onShow() {
      this.isShow = !this.isShow
    },
    onCopy: _.throttle(function() {
      const inputDom = document.createElement('input')
      inputDom.id = 'createInputDom'
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
    }, 1800),
    onDownload() {
      downloadText(this.cellValue, this.name + '.txt')
    }
  }
}
</script>
<style lang="scss" scoped>
  .content {
    display: flex;
    width: 100%;
    overflow: hidden;
    //white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;

    .text {
      flex: 1;
      margin: 0;
      padding: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .action {
      float: right;
      font-size: 15px;
      cursor: pointer;
      margin-left: 5px;

      .fa {
        margin-right: 10px;

        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
</style>
