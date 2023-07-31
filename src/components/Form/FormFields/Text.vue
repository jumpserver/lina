<template>
  <span>
    {{ text }}
  </span>
</template>

<script>
export default {
  name: 'Text',
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  methods: {
    onClick() {
      window.open(this.href)
    }
  }
}
</script>

<style scoped>

</style>
