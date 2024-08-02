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
import { getOrgSelect2Meta } from '@/views/settings/Auth/const'

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
      return [
        [this.$t('Basic'), [
          'AUTH_LARK', 'LARK_APP_ID',
          'LARK_APP_SECRET', 'LARK_RENAME_ATTRIBUTES'
        ]],
        [this.$t('Other'), [
          'LARK_ORG_IDS'
        ]]
      ]
    },
    encryptedFields() {
      return ['LARK_APP_SECRET']
    },
    formFieldsMeta() {
      return {
        LARK_RENAME_ATTRIBUTES: {
          component: JsonEditor
        },
        LARK_ORG_IDS: getOrgSelect2Meta()
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
