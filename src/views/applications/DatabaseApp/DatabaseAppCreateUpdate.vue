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
        [this.$t('applications.mysql'), ['attrs']],
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
        let url = `/api/v1/applications/applications/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?category=db`
      },
      performSubmit(validValues) {
        const url = this.getUrl()
        validValues.attrs = {
          host: validValues.host,
          port: validValues.port,
          database: validValues.database
        }
        validValues.category = 'db'
        return this.$axios['put'](`${url}&type=${validValues.type}`, validValues)
      }
    }
  },
  computed: {
    initial() {
      return this.$route.query
    }
  }
}
</script>

<style lang="less" scoped>

</style>
