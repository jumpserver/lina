<template>
  <FeiShu
    :category="category"
    :form-fields="formFields"
    :title="$tc('setting.Lark')"
    :encrypted-fields="encryptedFields"
    :enable-field-name="enableFieldName"
  />
</template>

<script>
import FeiShu from './FeiShu'

export default {
  name: 'Lark',
  components: {
    FeiShu
  },
  computed: {
    category() {
      return 'lark'
    },
    enableFieldName() {
      return 'AUTH_LARK'
    },
    formFields() {
      return ['AUTH_LARK', 'LARK_APP_ID', 'LARK_APP_SECRET']
    },
    encryptedFields() {
      return ['LARK_APP_SECRET']
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
