<template>
  <div style="display: block">
    <el-button size="small" type="primary" @click="visible = true">
      {{ $t('Setting') }}
    </el-button>
    <Dialog
      v-model:visible="iVisible"
      :destroy-on-close="true"
      :title="$tc('PasswordRule')"
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
import vModelMixin from '@/utils/vue/vModelMixin'

export default {
  name: 'PasswordRule',
  components: { Dialog, AutoDataForm },
  mixins: [vModelMixin('visible')],
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
            label: this.$t('Length'),
            type: 'input-number',
            el: {
              min: 8,
              max: 36,
              size: 'mini'
            }
          },
          {
            id: 'uppercase',
            label: this.$t('Uppercase'),
            type: 'checkbox'
          },
          {
            id: 'lowercase',
            label: this.$t('Lowercase'),
            type: 'checkbox'
          },
          {
            id: 'digit',
            label: this.$t('Digit'),
            type: 'checkbox'
          },
          {
            id: 'symbol',
            label: this.$t('SpecialSymbol'),
            type: 'checkbox'
          },
          {
            id: 'exclude_symbols',
            label: this.$t('ExcludeSymbol'),
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
    handleOpen() {}
  }
}
</script>

<style scoped></style>
