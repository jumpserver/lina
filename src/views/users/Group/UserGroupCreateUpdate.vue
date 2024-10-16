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
          users: []
        },
        url: '/api/v1/users/groups/',
        fields: [
          [this.$t('Basic'), ['name', 'users']],
          [this.$t('Other'), ['comment']]
        ],
        fieldsMeta: {
          users: {
            el: {
              url: '/api/v1/users/users/?fields_size=mini&order=name',
              ajax: {
                transformOption: (item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
                }
              },
              resource: this.$t('User')
            }
          }
        }
      }
    }
  }
}
</script>
