<template>
  <el-dialog
    v-bind="dialogAttrs"
    ref="dialog"
    v-model="visible"
    :title="title"
    @close="resetFields"
    @opened="handleOpened"
  >
    <!--https://github.com/FEMessage/el-form-renderer-->
    <el-form-renderer v-bind="formAttrs" ref="form" :content="form" :disabled="isView">
      <!--@slot 额外的弹窗表单内容, 当form不满足需求时可以使用，参考：https://femessage.github.io/el-form-renderer/#/Demo?id=slot -->
      <slot :row="slotData" />
    </el-form-renderer>

    <template v-if="!isView" #footer>
      <div>
        <el-button :size="buttonSize" @click="visible = false">取 消</el-button>
        <el-button type="primary" :loading="confirmLoading" :size="buttonSize" @click="confirm"
          >确 定</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
/* eslint-disable vue/require-default-prop */
import ElFormRenderer from '@/components/Form/DataForm/components/el-form-renderer'

export const dialogModes = {
  new: 'new',
  edit: 'edit',
  view: 'view'
}

export default {
  components: {
    ElFormRenderer
  },
  props: {
    newTitle: {
      type: String,
      required: true
    },
    editTitle: {
      type: String,
      required: true
    },
    viewTitle: {
      type: String,
      required: true
    },
    form: {
      type: Array,
      required: true
    },
    formAttrs: {
      type: Object,
      required: true
    },
    dialogAttrs: {
      type: Object,
      required: true
    },
    buttonSize: String
  },
  emits: ['confirm'],
  data() {
    return {
      mode: dialogModes.new,
      visible: false,
      confirmLoading: false,
      slotData: null,
      pendingFormValue: null
    }
  },
  computed: {
    title() {
      switch (this.mode) {
        case dialogModes.edit:
          return this.editTitle
        case dialogModes.view:
          return this.viewTitle
        default:
          return this.newTitle
      }
    },
    isView() {
      return this.mode === dialogModes.view
    }
  },
  methods: {
    /**
     * 显示dialog
     * @public
     */
    show(mode, formValue) {
      this.mode = mode
      this.pendingFormValue = formValue || null
      this.slotData = null
      this.visible = true
    },
    handleOpened() {
      if (!this.pendingFormValue) {
        return
      }

      this.$refs.form.updateForm(this.pendingFormValue)
      this.slotData = this.pendingFormValue
      this.pendingFormValue = null
    },
    async confirm() {
      const valid = await new Promise(this.$refs.form.validate)
      if (!valid) return

      const formValue = this.$refs.form.getFormValue()
      const isNew = this.mode === dialogModes.new
      this.confirmLoading = true
      const done = (close = true) => {
        this.confirmLoading = false
        if (close) this.visible = false
      }
      this.$emit('confirm', isNew, formValue, done)
    },
    resetFields() {
      this.$refs.form.resetFields()
      this.slotData = null
      this.pendingFormValue = null
    }
  }
}
</script>

<style></style>
