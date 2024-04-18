<template>
  <BaseAuth
    :config="settings"
    :title="title"
    enable-field="enableFieldName"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { UpdateToken } from '@/components/Form/FormFields'

export default {
  name: 'Feishu',
  components: {
    BaseAuth
  },
  props: {
    category: {
      type: String,
      default: 'feishu'
    },
    title: {
      type: String,
      default() {
        return this.$t('setting.Feishu')
      }
    },
    encryptedFields: {
      type: Array,
      default: () => ['FEISHU_APP_SECRET']
    },
    formFields: {
      type: Array,
      default: () => ['AUTH_FEISHU', 'FEISHU_APP_ID', 'FEISHU_APP_SECRET']
    },
    enableFieldName: {
      type: String,
      default: 'AUTH_FEISHU'
    }
  },
  data() {
    const vm = this
    return {
      settings: {
        url: `/api/v1/settings/setting/?category=${vm.category}`,
        hasDetailInMsg: false,
        moreButtons: [
          {
            title: this.$t('common.Test'),
            loading: false,
            callback: function(value, form, btn) {
              btn.loading = true
              vm.$axios.post(
                `/api/v1/settings/${vm.category}/testing/`,
                value
              ).then(res => {
                vm.$message.success(res['msg'])
              }).catch(() => {
                vm.$log.error('err occur')
              }).finally(() => { btn.loading = false })
            }
          }
        ],
        encryptedFields: this.encryptedFields,
        fields: [
          [
            this.$t('common.BasicInfo'),
            this.formFields
          ]
        ],
        // 不清理的话，编辑secret，在删除提交会报错
        cleanFormValue(data) {
          this.encryptedFields.forEach(field => {
            if (!data[field]) {
              delete data[field]
            }
          })
          return data
        },
        submitMethod() {
          return 'put'
        }
      }
    }
  },
  mounted() {
    this.settings.fieldsMeta = this.encryptedFields.reduce((acc, field) => {
      acc[field] = {
        component: UpdateToken
      }
      return acc
    }, {})
  },
  methods: {}
}
</script>

<style scoped>

</style>
