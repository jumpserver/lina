<template>
  <div>
    <input type="file" @change="Onchange">
    <div v-if="tip !== ''">{{ tip }}</div>
    <div>
      <img :src="src" v-bind="$attrs">
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
  computed: {
    src() {
      if (process.env.VUE_APP_BASE_API === '/') {
        return this.value
      }
      return `${process.env.VUE_APP_BASE_API}${this.value}`
    }
  },
  watch: {
    value(value) {
      this.$emit('customEvent', value)
    }
  },
  methods: {
    onInput(val) {
      this.$emit('input', 'upload-field: ' + val)
    },
    Onchange(e) {
      this.$emit('fileChange', e.target.files[0])
    }
  }
}
</script>

<style scoped>

</style>
