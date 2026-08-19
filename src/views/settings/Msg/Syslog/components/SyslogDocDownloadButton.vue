<template>
  <el-button
    size="mini"
    type="primary"
    icon="el-icon-download"
    @click="handleDownload"
  >
    {{ $t('Download') }}
  </el-button>
</template>

<script>
import { addBasePath, download } from '@/utils/common/index'

export default {
  name: 'SyslogDocDownloadButton',
  methods: {
    handleDownload() {
      download(addBasePath('/api/v1/settings/syslog/doc/download/'))
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
