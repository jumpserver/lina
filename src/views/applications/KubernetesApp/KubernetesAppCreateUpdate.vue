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
        [this.$t('common.Basic'), ['name', 'type', 'domain']],
        [this.$t('applications.kubernetes'), ['attrs']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        type: {
          disabled: true
        },
        attrs: {
          fields: ['cluster'],
          fieldsMeta: {
            cluster: {
              helpText: this.$t('applications.clusterHelpTextMessage')
            }
          }
        },
        domain: {
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: '/api/v1/assets/domains/'
            }
          }
        }
      },
      url: '/api/v1/applications/applications/',
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/applications/applications/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?type=k8s`
      },
      performSubmit(validValues) {
        const params = this.$route.params
        const baseUrl = `/api/v1/applications/applications/`
        const url = (params.id) ? `${baseUrl}${params.id}/` : baseUrl
        const method = this.getMethod()
        validValues.category = 'cloud'
        return this.$axios[method](`${url}?type=${validValues.type}`, validValues)
      }
    }
  },
  computed: {
    getMethod() {
      const params = this.$route.params
      if (params.id) {
        return 'put'
      } else {
        return 'post'
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
