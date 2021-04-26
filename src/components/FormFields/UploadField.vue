<template>
  <div>
    <input type="file" @change="Onchange">
    <div v-if="tip !== ''">{{ tip }}</div>
    <input v-model="value" type="text" hidden v-on="$listeners">
    <div>
      <img :src="preview" v-bind="$attrs">
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
    }
  },
  data() {
    return {
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
    onInput(val) {
      this.$emit('input', val)
    },
    Onchange(e) {
      if (e.target.files[0] === undefined) {
        this.$emit('input', this.initial)
        return
      }
      this.$emit('fileChange', e.target.files[0])
      this.$emit('input', this.getObjectURL(e.target.files[0]))
    },
    getObjectURL(file) {
      let url = null
      if (window.createObjectURL !== undefined) { // basic
        url = window.createObjectURL(file)
      } else if (window.URL !== undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file)
      } else if (window.webkitURL !== undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file)
      }
      return url
    }
  }
}
</script>

<style scoped>

</style>
