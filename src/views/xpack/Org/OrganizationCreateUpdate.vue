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
                transformOption: (item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
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
                transformOption: (item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
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
                transformOption: (item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
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
