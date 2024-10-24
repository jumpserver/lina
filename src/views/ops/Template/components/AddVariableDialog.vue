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
      :encrypt-password="false"
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
    }
  },
  methods: {
    addVariable(variable) {
      const i = this.variables.findIndex(item => item.username === variable.username)
      if (i !== -1) {
        this.variables.splice(i, 1)
      }
      this.variables.push(variable)
      this.iVisible = false
    },
    editVariable(form) {
      const i = this.variables.findIndex(item => item.username === this.variable.username)
      this.variables.splice(i, 1, form)
      this.iVisible = false
    }
  }
}
</script>

<style scoped>

</style>
