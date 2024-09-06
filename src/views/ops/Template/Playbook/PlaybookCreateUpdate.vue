<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import rules from '@/components/Form/DataForm/rules'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/ops/playbooks/',
      fields: [
        [this.$t('Basic'), ['name', 'comment', 'scope', 'participants']]
      ],
      fieldsMeta: {
        participants: {
          hidden: (item) => ['public', 'private'].includes(item.scope),
          rules: [rules.RequiredChange],
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
      },
      createSuccessNextRoute: {
        name: 'Template'
      },
      updateSuccessNextRoute: {
        name: 'Template'
      }
    }
  }
}
</script>

<style scoped>

</style>
