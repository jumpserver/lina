<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import CodeEditor from '@/components/FormFields/CodeEditor'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/ops/adhocs/',
      fields: [
        [this.$t('common.Basic'), ['name', 'module', 'args']]
      ],
      initial: {
        module: 'shell',
        args: ''
      },
      fieldsMeta: {
        args: {
          label: 'content',
          component: CodeEditor
        }
      },
      createSuccessNextRoute: {
        name: 'Adhoc'
      },
      updateSuccessNextRoute: {
        name: 'Adhoc'
      }
    }
  }
}
</script>

<style scoped>

</style>
