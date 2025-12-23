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
    <VariableCreateForm
      :variable="variable"
      @add="addVariable"
      @edit="editVariable"
    />
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
    },
    variables: {
      type: Array,
      default: () => ([])
    }
  },
  emits: ['update:visible'],
  methods: {
    addVariable(variable) {
      const i = this.variables.findIndex(item => item.name === variable.name || item.var_name === variable.var_name)
      if (i !== -1) {
        this.variables.splice(i, 1)
      }
      this.variables.push(variable)
      this.$emit('update:visible', false)
    },
    editVariable(form) {
      const i = this.variables.findIndex(item => item.var_name === this.variable.var_name)
      this.variables.splice(i, 1, form)
      const count = this.variables.filter(value => value.var_name === form.var_name || value.name === form.name).length
      // 不允许有相同的变量名
      if (count > 1) {
        this.variables.splice(i, 1)
      }
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>

</style>
