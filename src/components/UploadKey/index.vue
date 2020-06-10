<template>
  <div class="upload-key">
    <input type="file" @change="onChange">
    <div v-if="tip !== ''">{{ tip }}</div>
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
  methods: {
    onChange(e) {
      if (e.target.files.length === 0) {
        return
      }
      const vm = this
      const reader = new FileReader()
      reader.onload = function() {
        vm.$emit('input', this.result)
      }
      reader.readAsText(
        e.target.files[0]
      )
    }
  }
}
</script>

<style scoped>
</style>
