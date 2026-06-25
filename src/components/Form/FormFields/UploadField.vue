<template>
  <div class="upload-field">
    <input ref="upLoadFile" :accept="accept" style="display: none" type="file" @change="Onchange" />
    <div class="upload-field__actions">
      <el-button size="small" @click.stop="onUpLoad">
        {{ $t('SelectFile') }}
      </el-button>
      <span v-if="fileName" class="upload-field__filename">{{ fileName }}</span>
      <el-button v-if="fileName" size="small" type="danger" @click.stop="resetUpload">
        {{ $t('Cancel') }}
      </el-button>
    </div>
    <div v-if="tip !== ''" class="help-block">{{ tip }}</div>
    <input :value="value" hidden type="text" @input="onInput($event.target.value)" />
    <div v-if="preview" class="upload-field__preview" :class="{ 'show-bg': showBG }">
      <el-image
        :style="previewStyle"
        :preview-src-list="[preview]"
        :src="preview"
        fit="contain"
        preview-teleported
      />
    </div>
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
    },
    // 预览尺寸（px）。不同字段建议不同大小：方形 logo 82、网站图标 16、登录大图 492×472。
    width: {
      type: [String, Number],
      default: ''
    },
    height: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      fileName: '',
      initial: this.value,
      preview: this.value
    }
  },
  computed: {
    previewStyle() {
      const toPx = (v) => (typeof v === 'number' ? `${v}px` : v)
      const style = {}
      if (this.width) {
        style.width = toPx(this.width)
      }
      if (this.height) {
        style.height = toPx(this.height)
      }
      return style
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
.upload-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-field__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.upload-field__filename {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.upload-field__preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  min-height: 32px;
  border-radius: 2px;
  background: #fff;
  box-sizing: content-box;

  :deep(.el-image) {
    display: inline-flex;
  }

  :deep(.el-image__inner) {
    object-fit: contain;
  }
}

/* 顶部宽 logo 等可能是白底/透明图，给预览盒铺品牌背景色，避免白底图“看不见” */
.upload-field__preview.show-bg {
  background-color: var(--banner-bg);
  border-color: var(--banner-bg);
}
</style>
