<template>
  <div class="upload-secret-wrapper">
    <el-input v-model="iValue" :placeholder="placeholder" :rows="rows" type="textarea" />
    <el-upload
      v-bind="$attrs"
      ref="upload"
      :accept="accept"
      :action="''"
      :auto-upload="false"
      :file-list="fileList"
      :limit="limit"
      :on-change="handleChange"
      :on-remove="handleRemove"
      class="upload-secret"
    >
      <el-button size="small" type="primary">
        {{ $t(btnText || 'SelectFile') }}
      </el-button>
      <template #tip>
        <div v-if="tip" class="el-upload__tip">
          {{ tip }}
        </div>
      </template>
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
      default: () => ''
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
      reader.onload = function (res) {
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
.upload-secret-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  :deep(.el-textarea),
  :deep(.el-textarea__inner) {
    width: 100%;
  }
}

.upload-secret {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;

  &:deep(.el-list-enter-active),
  &:deep(.el-list-leave-active) {
    transition: none;
  }

  &:deep(.el-list-enter),
  &:deep(.el-list-leave-active) {
    opacity: 0;
  }

  &:deep(.el-upload-list) {
    // 占满「选择文件」按钮右侧的剩余宽度。flex-basis 归零(1 1 0)+ min-width:0,
    // 使列表宽度只由剩余空间决定、不被超长文件名撑破;否则一串无换行点的长名会溢出容器。
    flex: 1 1 0;
    min-width: 0;
    max-width: 100%;
    height: 40px;
    margin: 0;
  }

  &:deep(.el-upload-list__item) {
    min-width: 0;
    margin-top: 0;
  }

  // 文件名用满可用宽度,超长时以省略号截断(需逐级 min-width:0 + 自身裁剪才生效)
  &:deep(.el-upload-list__item-name) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:deep(.el-button) {
    min-height: 30px;
    height: 30px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
