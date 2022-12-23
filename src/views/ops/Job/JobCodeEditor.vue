<template>
  <div>
    <VariableHelpDialog :visible.sync="showHelpDialog" />
    <AdhocOpenDialog v-if="showOpenAdhocDialog" :visible.sync="showOpenAdhocDialog" @select="onSelectAdhoc" />
    <AdhocSaveDialog
      v-if="showOpenAdhocSaveDialog"
      :args="iValue"
      :visible.sync="showOpenAdhocSaveDialog"
    />
    <CodeEditor :value.sync="iValue" :toolbar="toolbar" />
  </div>
</template>

<script>
import CodeEditor from '@/components/FormFields/CodeEditor'
import AdhocOpenDialog from '@/views/ops/Job/AdhocOpenDialog'
import AdhocSaveDialog from '@/views/ops/Job/AdhocSaveDialog'
import VariableHelpDialog from '@/views/ops/Job/VariableHelpDialog'

export default {
  components: {
    CodeEditor,
    AdhocOpenDialog,
    AdhocSaveDialog,
    VariableHelpDialog
  },
  props: {
    value: {
      type: [String, Object],
      default: () => ''
    }
  },
  data() {
    return {
      showOpenAdhocDialog: false,
      showOpenAdhocSaveDialog: false,
      showHelpDialog: false,
      toolbar: [
        {
          type: 'button',
          align: 'right',
          icon: 'fa fa-folder-open',
          tip: this.$t('ops.OpenCommand'),
          callback: (val, setting) => {
            this.openAdhocSelectDialog()
          }
        },
        {
          type: 'button',
          align: 'right',
          icon: 'fa fa-save',
          tip: this.$t('ops.SaveCommand'),
          callback: (val, setting) => {
            this.openAdhocSaveDialog()
          }
        },
        {
          type: 'button',
          align: 'right',
          icon: 'fa fa-question-circle',
          tip: this.$t('ops.Help'),
          callback: (val, setting) => {
            this.openHelpDialog()
          }
        }
      ]
    }
  },
  computed: {
    iValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('change', val)
      }
    }
  }, methods: {
    openHelpDialog() {
      this.showHelpDialog = true
    },
    openAdhocSelectDialog() {
      this.showOpenAdhocDialog = true
    },
    openAdhocSaveDialog() {
      if (!this.iValue.length > 0) {
        this.$message.error(this.$tc('ops.CommandNotBeNone'))
        return
      }
      this.showOpenAdhocSaveDialog = true
    },
    onSelectAdhoc(adhoc) {
      this.iValue = adhoc.args
    }
  }
}
</script>

<style scoped>

</style>
