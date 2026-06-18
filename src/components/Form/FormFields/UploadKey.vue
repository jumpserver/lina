<template>
  <div class="upload-key">
    <input ref="upLoadFile" style="display: none" type="file" @change="onChange" />
    <div class="upload-key__actions">
      <el-button v-if="!fingerprint" size="small" @click.stop="onUpLoad">
        {{ $t('SelectFile') }}
      </el-button>
      <template v-else>
        <el-button size="small" @click.stop="onUpLoad">
          {{ $t('Update') }}
        </el-button>
        <span v-if="!fileName" class="fingerprint">{{ fingerprint }}</span>
      </template>
      <span v-if="fileName" class="upload-key__filename">{{ fileName }}</span>
    </div>
    <div v-if="tip !== ''" class="upload-key__tip">{{ tip }}</div>
  </div>
</template>

<script>
export default {
  props: {
    tip: {
      type: String,
      default: () => ''
    },
    toFormat: {
      type: String,
      default: () => 'string'
    },
    fingerprint: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fileName: ''
    }
  },
  methods: {
    onUpLoad() {
      this.$refs.upLoadFile.click()
    },
    onChange(e) {
      const upLoadFile = e.target.files
      if (upLoadFile.length === 0) {
        return
      }
      const vm = this
      this.fileName = upLoadFile[0].name || ''
      const reader = new FileReader()
      reader.onload = function () {
        let result = this.result
        if (vm.toFormat === 'object' && vm.fileName.endsWith('.json')) {
          result = JSON.parse(result)
        }
        vm.$emit('input', result)
      }
      reader.readAsText(upLoadFile[0])
    }
  }
}
</script>

<style scoped>
.upload-key {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-key__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.upload-key__filename,
.upload-key__tip {
  font-size: 12px;
  line-height: 1.4;
}

.upload-key__filename {
  color: var(--color-text-secondary);
}

.fingerprint {
  font-size: 12px;
}
</style>
