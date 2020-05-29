<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      config: {
        initial: {
        },
        url: '/api/v1/orgs/orgs/',
        fields: ['name', 'admins', 'auditors', 'users', 'comment'],
        fieldsMeta: {
          admins: {
            label: this.$t('xpack.Admin'),
            el: {
              value: [],
              ajax: {
                url: '/api/v1/users/users/?fields_size=mini',
                processResults(data) {
                  let results = data.results
                  results = results.map((item) => {
                    return { label: item.name + '(' + item.username + ')', value: item.id }
                  })
                  const more = !!data.next
                  return { results: results, pagination: more, total: data.count }
                }
              }
            }
          },
          auditors: {
            label: this.$t('xpack.Auditor'),
            el: {
              value: [],
              ajax: {
                url: '/api/v1/users/users/?fields_size=mini',
                processResults(data) {
                  let results = data.results
                  results = results.map((item) => {
                    return { label: item.name + '(' + item.username + ')', value: item.id }
                  })
                  const more = !!data.next
                  return { results: results, pagination: more, total: data.count }
                }
              }
            }
          },
          users: {
            label: this.$t('xpack.User'),
            el: {
              value: [],
              ajax: {
                url: '/api/v1/users/users/?fields_size=mini',
                processResults(data) {
                  let results = data.results
                  results = results.map((item) => {
                    return { label: item.name + '(' + item.username + ')', value: item.id }
                  })
                  const more = !!data.next
                  return { results: results, pagination: more, total: data.count }
                }
              }
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
