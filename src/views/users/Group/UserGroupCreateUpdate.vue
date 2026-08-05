<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { ResourceSelect } from '@/components/Form/FormFields'
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
          name: {
            uniqueCheck: true
          },
          users: {
            type: 'resourceSelect',
            component: ResourceSelect,
            el: {
              value: [],
              url: '/api/v1/users/users/?fields_size=mini&order=name',
              resourceName: this.$t('Users')
            }
          }
        }
      }
    }
  }
}
</script>
