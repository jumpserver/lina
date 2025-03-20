<template>
  <div>
    <input ref="upLoadFile" :accept="accept" style="display: none" type="file" @change="Onchange">
    <el-button size="mini" @click.native.stop="onUpLoad">
      {{ this.$t('SelectFile') }}
    </el-button>
    <span>{{ fileName }}</span>
    <div v-if="tip !== ''" class="help-block">{{ tip }}</div>
    <input v-model="value" hidden type="text" v-on="$listeners">
    <div>
      <img v-if="preview" :class="showBG ? 'show-bg' : ''" :src="preview" v-bind="$attrs" alt="">
    </div>
    <el-button v-if="fileName" size="mini" type="danger" @click.native.stop="resetUpload">
      {{ this.$t('Cancel') }}
    </el-button>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: () => ''
    },
    tip: {
      type: String,
      default: () => ''
    },
    accept: {
      type: String,
      default: '*'
    },
    showBG: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileName: '',
      initial: this.value,
      preview: this.value
    }
  },
  watch: {
    value(value) {
      this.$emit('customEvent', value)
      this.preview = this.value
    }
  },
  methods: {
    onUpLoad() {
      this.$refs.upLoadFile.click()
    },
    onInput(val) {
      this.$emit('input', val)
    },
    Onchange(e) {
      const upLoadFile = e.target.files[0]

      if (upLoadFile === undefined) {
        return
      }

      this.fileName = upLoadFile?.name || ''
      this.$emit('fileChange', upLoadFile)
      this.$emit('input', this.getObjectURL(upLoadFile))
    },
    resetUpload() {
      this.fileName = ''
      this.preview = ''
      this.$refs.upLoadFile.value = ''
      this.$emit('input', '')
      this.$emit('fileChange', null)
    },
    getObjectURL(file) {
      let url = null
      if (window.createObjectURL !== undefined) {
        url = window.createObjectURL(file)
      } else if (window.URL !== undefined) {
        url = window.URL.createObjectURL(file)
      } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(file)
      }
      return url
    }
  }
}
</script>

<style lang="scss" scoped>
.show-bg {
  background-color: var(--banner-bg);
}
</style>
