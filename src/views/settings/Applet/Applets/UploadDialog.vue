<template>
  <Dialog
    title="离线上传"
    v-bind="$attrs"
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
          :on-change="onFileChange"
          :before-upload="beforeUpload"
          accept=".zip"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">{{ $t('common.imExport.dragUploadFileInfo') }}</div>
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
      renderError: ''
    }
  },
  methods: {
    onFileChange(file, fileList) {
    },
    beforeUpload(file) {
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
