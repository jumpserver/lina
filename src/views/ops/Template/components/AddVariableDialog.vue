<template>
  <Dialog
    v-if="visible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('AddVariable')"
    :visible="visible"
    width="800px"
    @update:visible="$emit('update:visible', $event)"
  >
    <VariableCreateForm :variable="variable" @add="confirmAdd" @edit="confirmEdit" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import VariableCreateForm from '@/components/Apps/VariableCreateUpdateForm'

export default {
  name: 'AddVariableDialog',
  components: {
    Dialog,
    VariableCreateForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    variable: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['add', 'edit', 'update:visible'],
  methods: {
    confirmAdd(variable) {
      this.$emit('add', variable)
      this.$emit('update:visible', false)
    },
    confirmEdit(form) {
      this.$emit('edit', form)
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped></style>
