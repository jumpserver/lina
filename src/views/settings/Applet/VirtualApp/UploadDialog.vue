<template>
  <Dialog
    :show-cancel="false"
    :title="$tc('common.OfflineUpload')"
    :before-close="handleClose"
    :loading-status="!isFinished"
    v-bind="$attrs"
    @cancel="onCancel"
    @confirm="onSubmit"
    v-on="$listeners"
  >
    <el-form label-position="top">
      <el-form-item
        :label="$tc('common.Upload' )"
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
          upload-files="uploadFiles"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            {{ $t('common.imExport.dragUploadFileInfo') }}
          </div>
          <div slot="tip" class="el-upload__tip">
            <span :class="{'hasError': hasFileFormatOrSizeError }">
              {{ $t('terminal.uploadZipTips') }}
            </span>
            <div v-if="renderError" class="hasError">{{ renderError }}</div>
          </div>
        </el-upload>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import { Dialog } from '@/components'

export default {
  name: 'UploadDialog',
  components: {
    Dialog
  },
  data() {
    return {
      hasFileFormatOrSizeError: false,
      renderError: '',
      file: null,
      isFinished: true
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
    handleClose(done) {
      if (this.isFinished) {
        done()
      } else {
        this.$message.warning(this.$tc('terminal.Uploading'))
      }
    },
    onCancel() {
      this.$emit('update:visible', false)
    },
    onSubmit() {
      if (!this.file) {
        return
      }
      this.isFinished = false
      const form = new FormData()
      form.append('file', this.file.raw)
      this.$axios.post(
        '/api/v1/terminal/virtual-apps/upload/',
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          disableFlashErrorMsg: true
        }
      ).then(res => {
        this.isFinished = true
        this.$message.success(this.$tc('terminal.UploadSucceed'))
        this.$emit('update:visible', false)
        this.$emit('upload-event', res)
      }).catch(err => {
        this.isFinished = true
        const error = err.response.data
        const msg = error?.message || error?.detail || error?.error || JSON.stringify(error)
        this.$message.error(msg)
      })

      setTimeout(() => {
        this.$refs.upload.clearFiles()
      }, 400)
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
