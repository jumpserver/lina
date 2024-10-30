<template>
  <Dialog
    v-if="iVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('setVariable')"
    :visible.sync="iVisible"
    width="800px"
  >
    <VariableSetForm
      :form-data="formData"
      :query-param="queryParam"
      @confirm="handleConfirm"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import VariableSetForm from '@/components/Apps/VariableSetForm'

export default {
  name: 'AddVariableDialog',
  components: {
    Dialog,
    VariableSetForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formValue: {
      type: Object,
      default: () => ({})
    },
    item: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    formData() {
      return this.item.variable.map((data) => {
        return data.form_data
      })
    },
    queryParam() {
      return 'job=' + this.item.id
    }
  },
  methods: {
    handleConfirm(variable) {
      this.$emit('submit', this.item, variable)
    }
  }
}
</script>

<style scoped>

</style>
