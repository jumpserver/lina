<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        type: 'k8s'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'type']],
        [this.$t('applications.kubernetes'), ['attrs']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        type: {
          disabled: true
        },
        cluster: {
          helpText: this.$t('applications.clusterHelpTextMessage')
        }
      },
      url: '/api/v1/applications/applications/',
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/applications/applications/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?category=cloud`
      },
      performSubmit(validValues) {
        const url = this.getUrl()
        validValues.attrs = {
          cluster: validValues.cluster
        }
        validValues.category = 'cloud'
        return this.$axios['put'](`${url}&type=${validValues.type}`, validValues)
      }
    }
  },
  computed: {

  }
}
</script>

<style lang="less" scoped>

</style>
