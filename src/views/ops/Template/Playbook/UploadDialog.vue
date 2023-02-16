<template>
  <Dialog
    :show-cancel="false"
    :title="$tc('ops.UploadPlaybook')"
    v-bind="$attrs"
    @confirm="onSubmit"
    v-on="$listeners"
  >
    <el-form label-position="top">
      <el-form-item
        :label-width="'100px'"
        class="file-uploader"
      >
        <el-upload
          ref="upload"
          :auto-upload="false"
          :before-upload="beforeUpload"
          :limit="1"
          :on-change="onFileChange"
          accept=".zip"
          action="string"
          drag
          list-type="text/csv"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            {{ $t('common.imExport.dragUploadFileInfo') }}
          </div>
          <div slot="tip" class="el-upload__tip">
            <span :class="{'hasError': hasFileFormatOrSizeError }" />
            <div v-if="renderError" class="hasError">{{ renderError }}</div>
            <h5>请上传包含以下示例结构目录的 .zip 压缩文件</h5>
            <pre style="display:flex; line-height: 1.2em">
./
├── roles
├── vars
├── set_env.yml
└── main.yml ({{ $tc('ops.RequiredEntryFile') }})
            </pre>
          </div>
        </el-upload>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import { Dialog } from '@/components'
import { uploadPlaybook } from '@/api/ops'

export default {
  components: {
    Dialog
  },
  data() {
    return {
      hasFileFormatOrSizeError: false,
      renderError: '',
      file: null
    }
  },
  methods: {
    onFileChange(file, fileList) {
      if (file.status !== 'ready') {
        return
      }
      this.file = file
    },
    beforeUpload(file) {
    },
    onSubmit() {
      if (!this.file) {
        return
      }
      const form = new FormData()
      form.append('path', this.file.raw)
      uploadPlaybook(form).then(res => {
        this.$emit('update:visible', false)
        this.$emit('completed')
        this.$message.success(this.$tc('terminal.UploadSucceed'))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.file-uploader.el-form-item {
  margin-bottom: 0;

  >>> .el-upload {
    width: 100%;

    .el-upload-dragger {
      width: 100%;
    }
  }
}

</style>
