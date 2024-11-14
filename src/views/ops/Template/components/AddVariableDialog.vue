<template>
  <Dialog
    v-if="iVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('AddVariable')"
    :visible.sync="iVisible"
    width="800px"
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
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    addVariable(variable) {
      const i = this.variables.findIndex(item => item.name === variable.name || item.var_name === variable.var_name)
      if (i !== -1) {
        this.variables.splice(i, 1)
      }
      this.variables.push(variable)
      this.iVisible = false
    },
    editVariable(form) {
      const i = this.variables.findIndex(item => item.var_name === this.variable.var_name)
      this.variables.splice(i, 1, form)
      const count = this.variables.filter(value => value.var_name === form.var_name || value.name === form.name).length
      // 不允许有相同的变量名
      if (count > 1) {
        this.variables.splice(i, 1)
      }
      this.iVisible = false
    }
  }
}
</script>

<style scoped>

</style>
