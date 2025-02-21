<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/ops/playbooks/',
      fields: [
        [this.$t('Basic'), ['name', 'scope', 'variable']],
        [this.$t('Other'), ['comment']]
      ],
      fieldsMeta: {
        variable: {
          hidden: () => true
        }
      },
      createSuccessNextRoute: {
        name: 'Template'
      },
      updateSuccessNextRoute: {
        name: 'Template'
      },
      cleanFormValue(value) {
        const isClone = this?.$route?.query.clone_from !== undefined
        if (isClone) {
          value?.variable.map((item) => {
            delete item.id
            delete item.playbook
            delete item.job
          })
        }
        return value
      }
    }
  }
}
</script>

<style scoped>

</style>
