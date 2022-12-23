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
        [this.$t('common.Basic'), ['name', 'comment', 'module', 'args']]
      ],
      initial: {
        module: 'shell',
        args: ''
      },
      fieldsMeta: {
        args: {
          component: CodeEditor
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
