<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
export default {
  name: 'CommandFilterCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {

      },
      fields: [
        // [this.$t('perms.' + 'Basic'), ['name', 'base', 'security', 'console', 'comment']]
      ],
      fieldsMeta: {

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
      url: '/api/v1/assets/cmd-filters/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
