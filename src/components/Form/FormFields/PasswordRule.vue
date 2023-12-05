<template>
  <div style="display: block">
    <el-button size="mini" type="primary" @click="visible=true">
      {{ $t('common.Setting') }}
    </el-button>
    <Dialog
      :destroy-on-close="true"
      :title="$tc('common.PasswordRule')"
      :visible.sync="visible"
      width="600px"
      @cancel="handleCancel"
      @confirm="handleConfirm"
      @open="handleOpen"
    >
      <AutoDataForm ref="dataform" v-bind="form" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import AutoDataForm from '@/components/Form/AutoDataForm/index.vue'

export default {
  name: 'PasswordRule',
  components: { Dialog, AutoDataForm },
  props: {
    value: {
      type: Object,
      default: () => ({
        length: 16
      })
    }
  },
  data() {
    return {
      visible: false,
      form: {
        url: '',
        hasButtons: false,
        hasReset: false,
        hasSaveContinue: false,
        form: Object.assign({}, this.value),
        fields: [
          {
            id: 'length',
            label: this.$t('common.Length'),
            type: 'input-number',
            el: {
              min: 8,
              max: 30
            }
          },
          {
            id: 'uppercase',
            label: this.$t('common.Uppercase'),
            type: 'switch'
          },
          {
            id: 'lowercase',
            label: this.$t('common.Lowercase'),
            type: 'switch'
          },
          {
            id: 'digit',
            label: this.$t('common.Digit'),
            type: 'switch'
          },
          {
            id: 'symbol',
            label: this.$t('common.SpecialSymbol'),
            type: 'switch'
          },
          {
            id: 'exclude_symbols',
            label: this.$t('common.ExcludeSymbol'),
            type: 'input'
          }
        ]
      }
    }
  },
  methods: {
    handleConfirm() {
      const formValue = this.$refs.dataform.dataForm.getFormValue()
      this.form.form = formValue
      this.$emit('input', formValue)
      setTimeout(() => {
        this.visible = false
      }, 100)
    },
    handleCancel() {
      this.$refs.dataform.dataForm.resetForm()
      setTimeout(() => {
        this.visible = false
      }, 100)
    },
    handleOpen() {
    }
  }
}
</script>

<style scoped>

</style>
