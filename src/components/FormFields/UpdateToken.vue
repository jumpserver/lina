<template>
  <div>
    <el-button v-show="!isShow" type="text" icon="el-icon-edit" @click="onUpdate">
      {{ text }}
    </el-button>
    <el-button v-show="isShowClear" type="text" icon="el-icon-delete" @click="onClear">
      {{ this.$tc('common.Clear') }}
    </el-button>
    <el-input
      v-show="isShow"
      v-model.trim="curValue"
      show-password
      :type="type"
      :rows="rows"
      autocomplete="new-password"
      :placeholder="placeholder"
      @change="onChange"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: () => ''
    },
    type: {
      type: String,
      default: () => 'input'
    },
    text: {
      type: String,
      default() {
        return this.$t('common.Update')
      }
    },
    showInput: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: () => ''
    },
    rows: {
      type: Number,
      default: () => 4
    },
    clearInfoObj: {
      type: Object,
      default: () => {
        return {
          url: '',
          clearFields: [],
          showClearButton: false
        }
      }
    }
  },
  data() {
    return {
      isShow: this.showInput,
      curValue: this.value,
      isShowClear: this.clearInfoObj.showClearButton
    }
  },
  created() {
    if (this.$route.path.indexOf('/update') !== -1) {
      this.isShow = false
    }
  },
  methods: {
    onClear() {
      if (!this.clearInfoObj?.url || !this.clearInfoObj?.clearFields) {
        this.$log.error('Not found url or clearFields or paramId')
        return
      }
      const data = {}
      this.clearInfoObj?.clearFields.forEach(f => {
        this.$set(data, f, '')
      })
      this.$axios.patch(
        this.clearInfoObj?.url, data,
      ).then(() => {
        this.isShow = true
        this.isShowClear = false
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      }).catch(err => {
        const errMsg = Object.values(err.response.data).join(', ')
        this.$message.error(this.$tc('common.updateErrorMsg') + ' ' + errMsg)
      })
    },
    onUpdate() {
      this.isShowClear = false
      this.isShow = true
    },
    onChange(e) {
      this.$emit('input', this.curValue)
    }
  }
}
</script>

<style scoped>
</style>
