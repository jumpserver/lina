<template>
  <Dialog
    :title="'选择模版'"
    :destroy-on-close="true"
    width="70%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <AutoDataTable :config="tableConfig" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import AutoDataTable from '@/components/AutoDataTable'
export default {
  name: 'AccountTemplateDialog',
  components: {
    Dialog,
    AutoDataTable
  },
  props: {
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/account-templates/',
        columns: ['name', 'username', 'privileged', 'actions'],
        columnsMeta: {
          privileged: {
            width: '100px'
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
