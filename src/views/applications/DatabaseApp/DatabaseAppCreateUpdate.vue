<template>
  <GenericCreateUpdatePage :initial="initial" v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {

      fields: [
        [this.$t('common.Basic'), ['name', 'type']],
        [this.$t('applications.DBInfo'), ['attrs']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        type: {
          type: 'select',
          options: [{
            label: 'MySQL',
            value: 'mysql'
          }],
          disabled: true
        },
        host: {
          type: 'input'
        }
      },
      url: '/api/v1/applications/applications/',
      getUrl() {
        const params = this.$route.params
        console.log(params)
        let url = `/api/v1/applications/applications/`
        const method = this.getMethod()
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return method === 'post' ? `${url}?type=${this.$route.query.type}` : `${url}?category=db`
      },
      performSubmit(validValues) {
        const params = this.$route.params
        const baseUrl = `/api/v1/applications/applications/`
        const url = (params.id) ? `${baseUrl}${params.id}/` : baseUrl
        const method = this.getMethod()
        validValues.attrs = {
          host: validValues.host,
          port: validValues.port,
          database: validValues.database
        }
        validValues.category = 'db'
        return this.$axios[method](`${url}?type=${validValues.type}`, validValues)
      }
    }
  },
  computed: {
    initial() {
      return this.$route.query
    },
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
