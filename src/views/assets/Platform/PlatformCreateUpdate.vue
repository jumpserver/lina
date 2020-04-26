<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" :perform-submit="performSubmit.bind(this)" />
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
        comment: ''
      },
      fields: [
        [this.$t('perms.' + 'Basic'), ['name', 'base', 'security', 'console', 'comment']]
      ],
      fieldsMeta: {
        security: {
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
          }],
          hidden: form => form.base !== 'Windows'
        },
        console: {
          type: 'select',
          label: 'RDP console',
          options: [{
            label: '是',
            value: 'true'
          }, {
            label: '否',
            value: 'false'
          }],
          hidden: form => form.base !== 'Windows'
        }
      },
      performSubmit: function(formdata) {
        console.log(formdata)
        var postData = {}
        if (formdata.base === 'Windows') {
          postData.meta = {}
          postData.meta.security = formdata.security
          postData.meta.console = (formdata.console === 'true')
        }
        postData.name = formdata.name
        postData.base = formdata.base
        postData.comment = formdata.comment || ''

        const params = this.$route.params
        if (params.id) {
          return this.$axios.put(
            `${this.url}${params.id}/`, postData
          )
        } else {
          return this.$axios.post(
            this.url, postData
          )
        }
      },
      url: '/api/v1/assets/platforms/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
