<template>
  <BaseAuth
    :value="value"
    :config="settings"
    :title="$t('setting.FeiShu')"
    enable-field="AUTH_FIESHU"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'

export default {
  name: 'Wecom',
  components: {
    BaseAuth
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
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
            callback: function(value, form) {
              vm.$axios.post(
                '/api/v1/settings/feishu/testing/',
                value
              ).then(res => {
                vm.$message.success(res['msg'])
              }).catch(() => {
                this.$log.error('err occur')
              })
            }
          }
        ],
        fields: [
          [
            this.$t('common.BasicInfo'),
            [
              'AUTH_FEISHU', 'FEISHU_APP_ID', 'FEISHU_APP_SECRET'
            ]
          ]
        ],
        fieldsMeta: {
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
  methods: {
  }
}
</script>

<style scoped>

</style>
