<template>
  <BaseAuth
    :config="settings"
    :title="$tc('setting.FeiShu')"
    enable-field="AUTH_FEISHU"
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
  data() {
    const vm = this
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=feishu',
        hasDetailInMsg: false,
        moreButtons: [
          {
            title: this.$t('setting.feiShuTest'),
            loading: false,
            callback: function(value, form, btn) {
              btn.loading = true
              vm.$axios.post(
                '/api/v1/settings/feishu/testing/',
                value
              ).then(res => {
                vm.$message.success(res['msg'])
              }).catch(() => {
                vm.$log.error('err occur')
              }).finally(() => { btn.loading = false })
            }
          }
        ],
        encryptedFields: ['FEISHU_APP_SECRET'],
        fields: [
          [
            this.$t('common.BasicInfo'),
            [
              'AUTH_FEISHU', 'FEISHU_APP_ID', 'FEISHU_APP_SECRET', 'FEISHU_VERSION'
            ]
          ]
        ],
        fieldsMeta: {
          FEISHU_APP_SECRET: {
            component: UpdateToken
          }
        },
        // 不清理的话，编辑secret，在删除提交会报错
        cleanFormValue(data) {
          if (!data['FEISHU_APP_SECRET']) {
            delete data['FEISHU_APP_SECRET']
          }
          return data
        },
        submitMethod() {
          return 'put'
        }
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
