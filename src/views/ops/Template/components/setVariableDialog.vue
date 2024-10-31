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
    handleConfirm(variable) {
      this.$emit('submit', variable)
    }
  }
}
</script>

<style scoped>

</style>
