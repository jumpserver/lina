<template>
  <Password
    :value="value"
    v-bind="iAttrs"
    class="el-input password-input"
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
      default: () => {}
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
  @import "~@/styles/element-variables.scss";
  .password-input >>> .Password__badge--error {
    background-color: $--color-danger;
  }
  .password-input >>> .Password__strength-meter--fill[data-score="4"] {
    background: $--color-primary;
    width: 100%;
  }

  .password-input >>> .Password__badge--success {
    background: $--color-primary;
  }

  .password-input >>> .Password__strength-meter {
    margin-bottom: 10px;
  }
</style>
