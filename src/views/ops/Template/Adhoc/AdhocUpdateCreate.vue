<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import CodeEditor from '@/components/Form/FormFields/CodeEditor'
import Variable from '@/views/ops/Template/components/Variable'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/ops/adhocs/',
      fields: [
        [this.$t('Basic'), ['name', 'scope', 'module', 'args', 'variable', 'comment']]
      ],
      initial: {
        module: 'shell',
        args: ''
      },
      fieldsMeta: {
        args: {
          component: CodeEditor
        },
        variable: {
          component: Variable
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
