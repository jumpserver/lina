<template>
  <div>
    <input type="file" @change="Onchange">
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
    Onchange(e) {
      // TODO 校验文件类型
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
