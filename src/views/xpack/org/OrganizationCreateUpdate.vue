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
            label: '管理员',
            el: {
              value: [],
              ajax: {
                url: '/api/v1/users/users/',
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
            label: '审计员',
            el: {
              value: [],
              ajax: {
                url: '/api/v1/users/users/',
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
            label: '用户',
            el: {
              value: [],
              ajax: {
                url: '/api/v1/users/users/',
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
