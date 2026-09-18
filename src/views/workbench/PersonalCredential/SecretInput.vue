<template>
  <el-input
    v-if="isSSHKey"
    :disabled="disabled"
    :model-value="inputValue"
    :rows="8"
    autocomplete="off"
    type="textarea"
    @update:model-value="handleInput"
  />
  <el-input
    v-else
    :autocomplete="autocomplete"
    :disabled="disabled"
    :model-value="inputValue"
    show-password
    type="password"
    @update:model-value="handleInput"
  />
</template>

<script>
export default {
  name: 'PersonalCredentialSecretInput',
  props: {
    autocomplete: {
      type: String,
      default: 'new-password'
    },
    context: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: String,
      default: undefined
    },
    value: {
      type: String,
      default: ''
    }
  },
  emits: ['input', 'update:modelValue'],
  computed: {
    inputValue() {
      return this.modelValue === undefined ? this.value : this.modelValue
    },
    isSSHKey() {
      return this.context.secretType === 'ssh_key'
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    }
  }
}
</script>
