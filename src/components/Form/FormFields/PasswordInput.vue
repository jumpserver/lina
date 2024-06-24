<template>
  <Password
    :value="value"
    class="el-input password-input"
    v-bind="iAttrs"
    @input="handleInput"
    v-on="$listeners"
  />
</template>

<script>
import Password from 'vue-password-strength-meter'

export default {
  name: 'PasswordInput',
  components: { Password },
  props: {
    value: {
      type: String,
      default: ''
    },
    attrs: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    iAttrs() {
      const defaultAttrs = {
        secureLength: 7,
        defaultClass: 'el-input__inner',
        toggle: true,
        showStrengthMeter: false
      }
      return Object.assign(defaultAttrs, this.attrs)
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss" scoped>
  .password-input ::v-deep .Password__badge--error {
    background-color: var(--color-danger);
  }

  .password-input ::v-deep .Password__strength-meter--fill[data-score="4"] {
    background: var(--color-success);
    width: 100%;
  }

  .password-input ::v-deep .Password__badge--success {
    background: var(--color-success);
  }

  .password-input ::v-deep .Password__strength-meter {
    margin-bottom: 10px;
  }
</style>
