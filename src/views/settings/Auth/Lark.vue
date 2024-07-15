<template>
  <FeiShu
    :category="category"
    :form-fields="formFields"
    :title="$tc('setting.Lark')"
    :encrypted-fields="encryptedFields"
    :form-fields-meta="formFieldsMeta"
    :enable-field-name="enableFieldName"
  />
</template>

<script>
import FeiShu from './FeiShu'
import { JsonEditor } from '@/components/Form/FormFields'
import { JsonRequiredUserNameMapped } from '@/components/Form/DataForm/rules'

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
      return ['AUTH_LARK', 'LARK_APP_ID', 'LARK_APP_SECRET', 'LARK_RENAME_ATTRIBUTES']
    },
    encryptedFields() {
      return ['LARK_APP_SECRET']
    },
    formFieldsMeta() {
      return {
        LARK_RENAME_ATTRIBUTES: {
          component: JsonEditor,
          rules: [JsonRequiredUserNameMapped]
        }
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
