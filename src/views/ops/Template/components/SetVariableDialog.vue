<template>
  <Dialog
    v-if="visible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('setVariable')"
    :visible="visible"
    width="800px"
    @update:visible="$emit('update:visible', $event)"
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
  name: 'SetVariableDialog',
  components: {
    Dialog,
    VariableSetForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Array,
      default: () => ([])
    },
    queryParam: {
      type: String,
      default: ''
    }
  },
  emits: ['update:visible', 'submit'],
  data() {
    return {}
  },
  methods: {
    handleConfirm(variable) {
      this.$emit('submit', variable)
    }
  }
}
</script>

<style scoped>

</style>
