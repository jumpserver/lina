<template>
  <div>
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

export default {
  components: {
    CodeEditor,
    AdhocOpenDialog,
    AdhocSaveDialog
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
      toolbar: [
        {
          type: 'button',
          icon: 'fa  fa-folder-open-o',
          tip: this.$t('ops.OpenCommand'),
          callback: () => {
            this.openAdhocSelectDialog()
          }
        },
        {
          type: 'button',
          icon: 'fa  fa-save',
          tip: this.$t('ops.SaveCommand'),
          callback: () => {
            this.openAdhocSaveDialog()
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
    openAdhocSelectDialog() {
      this.showOpenAdhocDialog = true
    },
    openAdhocSaveDialog() {
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
