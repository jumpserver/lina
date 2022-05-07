<template>
  <PasswordInput
    :value="value"
    :attrs="attrs"
    @input="handleInput"
  />
</template>

<script>
import PasswordInput from './PasswordInput'
import { encryptPassword } from '@/utils/jms'

export default {
  name: 'EncryptedPassword',
  components: { PasswordInput },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      attrs: {
      }
    }
  },
  computed: {
  },
  methods: {
    handleInput(value) {
      const cipher = encryptPassword(value)
      this.$emit('input', cipher)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
