<template>
  <PasswordInput
    :attrs="attrs"
    :value="value"
    @input="handleInput"
  />
</template>

<script>
import PasswordInput from './PasswordInput.vue'
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
    let userIsOrgAdmin = item.el.userIsOrgAdmin
    // undefined 个人信息更新或用户更改密码页面，使用当前用户；否则使用更新用户表单中传递的值
    userIsOrgAdmin = userIsOrgAdmin === undefined ? store.getters.currentUserIsAdmin : userIsOrgAdmin

    const passwordRule = store.getters.publicSettings.PASSWORD_RULE
    const validatePassword = function(rule, value, callback) {
      if (!value) {
        return callback()
      }
      const patterns = []
      if (passwordRule['SECURITY_PASSWORD_UPPER_CASE']) {
        patterns.push([/[A-Z]/, i18n.t('UPPER_CASE_REQUIRED')])
      }
      if (passwordRule['SECURITY_PASSWORD_LOWER_CASE']) {
        patterns.push([/[a-z]/, i18n.t('LOWER_CASE_REQUIRED')])
      }
      if (passwordRule['SECURITY_PASSWORD_NUMBER']) {
        patterns.push([/\d/, i18n.t('NUMBER_REQUIRED')])
      }
      if (passwordRule['SECURITY_PASSWORD_SPECIAL_CHAR']) {
        const pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？_+-]")
        patterns.push([pattern, i18n.t('SPECIAL_CHAR_REQUIRED')])
      }
      for (const [pattern, msg] of patterns) {
        if (!pattern.test(value)) {
          return callback(new Error(msg))
        }
      }
      let secureLength = passwordRule ? passwordRule['SECURITY_PASSWORD_MIN_LENGTH'] : 7
      if (userIsOrgAdmin) {
        secureLength = passwordRule ? passwordRule.SECURITY_ADMIN_USER_PASSWORD_MIN_LENGTH : 7
      }
      if (value.length < secureLength) {
        return callback(new Error(i18n.t('MIN_LENGTH_ERROR', [secureLength])))
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
        showStrengthMeter: true
      }
    }
  },
  computed: {
    ...mapGetters(['publicSettings'])
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
