<template>
  <Dialog
    :title="$tc('common.OfflineUpload')"
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
    onCancel() {
      this.$emit('update:visible', false)
    },
    onSubmit() {
      if (!this.file) {
        return
      }
      const form = new FormData()
      form.append('file', this.file.raw)
      this.$axios.post(
        '/api/v1/terminal/applets/upload/',
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          disableFlashErrorMsg: true
        }
      ).then(res => {
        this.$message.success(this.$t('terminal.UploadSucceed'))
        this.$emit('update:visible', false)
        this.$emit('upload-event', res)
      }).catch(err => {
        const error = err.response.data?.error || this.$t('terminal.UploadFailed')
        this.$message.error(error)
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
