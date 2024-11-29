<template>
  <BaseKV :config="$data" :title="$tc('AmazonSecretsManager')" />
</template>

<script>
import BaseKV from './Base.vue'

export default {
  name: 'AmazonSecretsManager',
  components: {
    BaseKV
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=aws_sm`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              '/api/v1/settings/vault/aws/testing/',
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch(() => {
              vm.$log.error('err occur')
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      encryptedFields: ['VAULT_AWS_ACCESS_SECRET_KEY'],
      fields: [
        [this.$t('AccountStorage'),
          [
            'VAULT_AWS_REGION_NAME',
            'VAULT_AWS_ACCESS_KEY_ID',
            'VAULT_AWS_ACCESS_SECRET_KEY'
          ]
        ]
      ],
      fieldsMeta: {
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
