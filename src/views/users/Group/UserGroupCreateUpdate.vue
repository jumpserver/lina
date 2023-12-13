<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import TransSelect from '@/components/Form/FormFields/TransferSelect.vue'

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
          [this.$t('common.Basic'), ['name', 'users']],
          [this.$t('common.Other'), ['comment']]
        ],
        fieldsMeta: {
          users: {
            component: TransSelect,
            el: {
              url: '/api/v1/users/users/?fields_size=mini&order=name',
              ajax: {
                transformOption: (item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
                }
              },
              resource: this.$t('common.User')
            }
          }
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>

</style>
