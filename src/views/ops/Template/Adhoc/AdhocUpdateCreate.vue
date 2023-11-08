<template>
  <GenericCreateUpdateDrawer v-bind="$data" />
</template>

<script>
import { GenericCreateUpdateDrawer } from '@/layout/components'
import CodeEditor from '@/components/Form/FormFields/CodeEditor'

export default {
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    return {
      url: '/api/v1/ops/adhocs/',
      fields: [
        [this.$t('common.Basic'), ['name', 'module', 'args', 'comment']]
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
