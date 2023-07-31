<template>
  <div class="">
    <el-input
      v-model="iValue"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder"
    />
    <el-upload
      ref="upload"
      class="upload-secret"
      :action="''"
      :accept="accept"
      :auto-upload="false"
      :limit="limit"
      v-bind="$attrs"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :file-list="fileList"
    >
      <el-button size="mini" type="primary">
        {{ btnText }}
      </el-button>
      <div v-if="tip" slot="tip" class="el-upload__tip">
        {{ tip }}
      </div>
    </el-upload>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: () => ''
    },
    btnText: {
      type: String,
      default: function() {
        return this.$t('common.SelectFile')
      }
    },
    rows: {
      type: Number,
      default: () => 4
    },
    limit: {
      type: Number,
      default: () => 2
    },
    accept: {
      type: String,
      default: () => ''
    },
    placeholder: {
      type: String,
      default: () => ''
    },
    tip: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      fileName: '',
      fileList: [],
      iValue: this.value
    }
  },
  watch: {
    iValue(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    handleChange(file, fileList) {
      const vm = this
      const newFileList = fileList.slice(-1)
      this.fileList = newFileList
      const reader = new FileReader()
      reader.onload = function(res) {
        const result = res.target.result
        vm.iValue = result
        vm.$emit('input', vm.iValue)
      }
      reader.readAsText(file.raw)
    },

    handleRemove() {
      this.iValue = ''
      this.fileList = []
      this.$emit('input', this.iValue)
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-secret {
  display: flex;
  &>>> .el-list-enter-active,
  &>>> .el-list-leave-active {
    transition: none;
  }
  &>>> .el-list-enter,
  &>>> .el-list-leave-active {
    opacity: 0;
  }
  &>>> .el-upload-list {
    height: 40px;
  }
}
</style>
