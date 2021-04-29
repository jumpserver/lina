<template>
  <PasswordInput
    :value="value"
    :attrs="attrs"
    @input="handleInput"
  />
</template>

<script>
import PasswordInput from './PasswordInput'
import { mapGetters } from 'vuex'
import store from '@/store'
import i18n from '@/i18n/i18n'

export default {
  name: 'UserPassword',
  components: { PasswordInput },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  rules(item) {
    const passwordRule = store.getters.publicSettings.PASSWORD_RULE
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      const patterns = []
      if (passwordRule.SECURITY_PASSWORD_UPPER_CASE) {
        patterns.push([/[A-Z]/, i18n.t('common.password.UPPER_CASE_REQUIRED')])
      }
      if (passwordRule.SECURITY_PASSWORD_LOWER_CASE) {
        patterns.push([/[a-z]/, i18n.t('common.password.LOWER_CASE_REQUIRED')])
      }
      if (passwordRule.SECURITY_PASSWORD_NUMBER) {
        patterns.push([/\d/, i18n.t('common.password.NUMBER_REQUIRED')])
      }
      if (passwordRule.SECURITY_PASSWORD_SPECIAL_CHAR) {
        const pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
        patterns.push([pattern, i18n.t('common.password.SPECIAL_CHAR_REQUIRED')])
      }
      for (const [pattern, msg] of patterns) {
        if (!pattern.test(value)) {
          return callback(new Error(msg))
        }
      }
      const secureLength = passwordRule ? passwordRule.SECURITY_PASSWORD_MIN_LENGTH : 7
      if (value.length < secureLength) {
        return callback(new Error(i18n.t('common.password.MIN_LENGTH_ERROR', [secureLength])))
      }
      callback()
    }
    return [
      { required: false, trigger: 'change', validator: validatePassword }
    ]
  },
  data() {
    return {
      attrs: {
        secureLength: 7
      }
    }
  },
  computed: {
    ...mapGetters(['publicSettings'])
  },
  created() {
    const passwordRule = this.publicSettings.PASSWORD_RULE || {}
    this.attrs.secureLength = passwordRule ? passwordRule.SECURITY_PASSWORD_MIN_LENGTH : 7
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
