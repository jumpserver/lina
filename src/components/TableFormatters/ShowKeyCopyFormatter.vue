<template>
  <div class="content">
    <span class="text">{{ currentValue }}</span>
    <span v-if="iValue" class="action">
      <el-tooltip
        v-if="hasShow"
        effect="dark"
        placement="top"
        :content="this.$tc('common.View')"
      >
        <i class="fa" :class="isShow ? 'fa-eye-slash' : 'fa-eye'" @click="onShow()" />
      </el-tooltip>
      <el-tooltip
        v-if="hasDownload"
        effect="dark"
        placement="top"
        :content="this.$tc('common.Download')"
      >
        <i class="fa fa-download" @click="onDownload()" />
      </el-tooltip>
      <el-tooltip
        v-if="hasCopy"
        effect="dark"
        placement="top"
        :content="this.$tc('common.Copy')"
      >
        <i class="fa fa-clone" @click="onCopy()" />
      </el-tooltip>
    </span>
  </div>
</template>

<script>
import { downloadText } from '@/utils/common'

export default {
  name: 'ShowKeyCopyFormatter',
  props: {
    name: {
      type: String,
      required: true
    },
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
    },
    hasDownload: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isShow: false
    }
  },
  computed: {
    iValue() {
      return this.value || this.cellValue
    },
    currentValue() {
      if (this.isShow) {
        return this.iValue
      } else {
        return '******'
      }
    }
  },
  methods: {
    onShow() {
      this.isShow = !this.isShow
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
    }, 1800),
    onDownload() {
      downloadText(this.iValue, this.name + '.txt')
    }
  }
}
</script>
<style lang="scss" scoped>
  .content {
    display: flex;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;

    .text {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .action {
      float: right;
      font-size: 15px;
      cursor: pointer;

      .fa {
        margin-right: 10px;
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
</style>
