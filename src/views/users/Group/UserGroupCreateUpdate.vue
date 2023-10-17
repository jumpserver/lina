<template>
  <GenericCreateUpdateDrawer v-bind="config" />
</template>

<script>
import { GenericCreateUpdateDrawer } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    return {
      config: {
        initial: {
          users: []
        },
        url: '/api/v1/users/groups/',
        fields: [
          [this.$t('common.Basic'), ['name', 'users', 'comment']]
        ],
        fieldsMeta: {
          users: {
            el: {
              ajax: {
                url: '/api/v1/users/users/?fields_size=mini&order=name',
                transformOption: (item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
                }
              }
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
