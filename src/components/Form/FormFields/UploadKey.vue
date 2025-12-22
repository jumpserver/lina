<template>
  <div class="upload-key">
    <input ref="upLoadFile" style="display: none" type="file" @change="onChange">
    <el-button v-if="!fingerprint" size="mini" @click.native.stop="onUpLoad">
      {{ $t('SelectFile') }}
    </el-button>
    <span v-else>
      <el-button icon="el-icon-edit" type="text" @click.native.stop="onUpLoad">
        {{ $t('Update') }}
      </el-button>
      <span v-if="!fileName" class="fingerprint">{{ fingerprint }}</span>
    </span>
    <span>{{ fileName }}</span>
    <div v-if="tip !== ''">{{ tip }}</div>
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
      reader.onload = function() {
        let result = this.result
        if (vm.toFormat === 'object' && vm.fileName.endsWith('.json')) {
          result = JSON.parse(result)
        }
        vm.$emit('input', result)
      }
      reader.readAsText(
        upLoadFile[0]
      )
    }
  }
}
</script>

<style scoped>
.fingerprint {
  font-size: 12px
}
</style>
