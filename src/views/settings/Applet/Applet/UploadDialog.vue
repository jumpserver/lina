<template>
  <Dialog
    title="离线上传"
    v-bind="$attrs"
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
          drag
          action="string"
          list-type="text/csv"
          :limit="1"
          :auto-upload="false"
          upload-files="uploadFiles"
          :on-change="onFileChange"
          :before-upload="beforeUpload"
          accept=".zip"
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
      }).catch(err => {
        const error = err.response.data?.error || this.$t('terminal.UploadFailed')
        this.$message.error(error)
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
