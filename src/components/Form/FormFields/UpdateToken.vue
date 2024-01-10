<template>
  <div>
    <el-button v-show="!isShow" icon="el-icon-edit" type="text" @click="isShow=true">
      {{ text }}
    </el-button>
    <el-input
      v-show="isShow"
      v-model.trim="curValue"
      :placeholder="placeholder"
      :type="type"
      autocomplete="new-password"
      show-password
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
        return this.$t('Update')
      }
    },
    showInput: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      isShow: this.showInput,
      curValue: this.value
    }
  },
  created() {
    if (this.$route.path.indexOf('/update') !== -1) {
      this.isShow = false
    }
  },
  methods: {
    onChange(e) {
      this.$emit('input', this.curValue)
    }
  }
}
</script>

<style scoped>
</style>
