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
        [this.$t('common.Basic'), ['name', 'type', 'domain']],
        [this.$t('applications.DBInfo'), ['host', 'port', 'database']],
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
        const method = this.getMethod()
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return method === 'post' ? `${url}?type=${this.$route.query.type}` : `${url}?category=db`
      },
      afterGetFormValue(object) {
        const _object = {}
        Object.keys(object).forEach((key) => {
          // https://stackoverflow.com/questions/26222604/why-is-array-instanceof-object
          if (object[key] instanceof Object && !(object[key] instanceof Array)) {
            Object.keys(object[key]).forEach(innerKey => {
              _object[innerKey] = object[key][innerKey]
            })
          } else {
            _object[key] = object[key]
          }
        })
        return _object
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
