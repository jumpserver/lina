<template>
  <Dialog
    v-if="iVisible"
    :title="$t('assets.SelectTemplate')"
    :visible.sync="iVisible"
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
    visible: {
      type: Boolean,
      default: false
    }
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
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  }
}
</script>

<style scoped>

</style>
