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
import { Select2 } from '@/components'

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
        LARK_ORG_IDS: {
          component: Select2,
          el: {
            popperClass: 'sync-setting-org',
            multiple: true,
            ajax: {
              url: '/api/v1/orgs/orgs/',
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          },
          hidden: () => {
            return !this.$hasLicense()
          }
        }
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
