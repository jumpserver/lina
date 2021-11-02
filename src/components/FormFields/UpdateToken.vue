<template>
  <div>
    <el-button v-show="!isShow" type="primary" size="small" @click="isShow=true">{{ text }}</el-button>
    <el-input v-show="isShow" v-model="curValue" :type="type" :placeholder="placeholder" show-password @change="onChange" />
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
    placeholder: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      isShow: false,
      curValue: this.value
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
