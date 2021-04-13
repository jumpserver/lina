<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'PlatformCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {
        base: 'Linux',
        console: 'true',
        security: 'RDP',
        comment: '',
        charset: 'utf8'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'base', 'charset', 'meta', 'comment']]
      ],
      fieldsMeta: {
        meta: {
          fields: ['security', 'console'],
          fieldsMeta: {
            security: {
              prop: 'meta.security',
              type: 'select',
              label: 'RDP security',
              options: [{
                label: 'RDP',
                value: 'rdp'
              },
              {
                label: 'NLA',
                value: 'nla'
              },
              {
                label: 'TLS',
                value: 'tls'
              },
              {
                label: 'Any',
                value: 'any'
              }]
            },
            console: {
              type: 'select',
              label: 'RDP console',
              options: [{
                label: this.$t('common.Yes'),
                value: 'true'
              }, {
                label: this.$t('common.No'),
                value: 'false'
              }]
            }
          },
          hidden: form => form.base !== 'Windows'
        }

      },
      url: '/api/v1/assets/platforms/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
