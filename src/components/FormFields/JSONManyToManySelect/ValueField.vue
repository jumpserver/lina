<template>
  <div>
    <TagInput v-if="Array.isArray(value)" :value="value" @input="handleInput" />
    <el-input v-else :value="value" @input="handleInput" />
  </div>
</template>

<script>
import TagInput from '@/components/FormFields/TagInput.vue'

export default {
  name: 'ValueField',
  components: { TagInput },
  props: {
    value: {
      type: [String, Number, Boolean, Array, Object],
      default: () => ''
    },
    match: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style scoped>

</style>
