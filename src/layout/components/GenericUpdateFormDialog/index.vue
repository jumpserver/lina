<template>
  <Dialog
    v-if="iVisible"
    v-model:visible="iVisible"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('UpdateSelected')"
    top="1vh"
    width="70%"
    v-bind="$attrs"
  >
    <el-alert v-if="tips" class="tips" type="success">{{ tips }}</el-alert>
    <el-row :gutter="20">
      <el-col :md="4" :sm="24">
        <div class="select-prop-label">
          <label>{{ selectPropertiesLabel }}</label>
        </div>
      </el-col>
      <el-col :md="18" :sm="24">
        <el-checkbox-group v-model="checkedFields" @change="handleCheckedFieldsChange">
          <el-checkbox
            v-for="(value, name) in iFormSetting.fieldsMeta"
            :key="name"
            :checked="true"
            :disabled="value.disabled"
            :label="name"
          >
            {{ value.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-col>
    </el-row>
    <el-row class="el-row-divider">
      <el-divider />
    </el-row>
    <el-row>
      <GenericCreateUpdateForm
        :key="internalKey"
        v-bind="iFormSetting"
      />
    </el-row>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  name: 'GenericUpdateFormDialog',
  components: {
    Dialog, GenericCreateUpdateForm
  },
  props: {
    selectedRows: {
      type: Array,
      default: () => ([])
    },
    formSetting: {
      type: Object,
      default: () => ({})
    },
    tips: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'update', 'submitError'],
  data: function() {
    return {
      internalKey: 0,
      selectPropertiesLabel: this.$t('SelectProperties'),
      checkedFields: [],
      iFormSetting: {}
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  },
  mounted() {
    const defaultFormSetting = this.getDefaultFormSetting()
    this.iFormSetting = Object.assign({}, defaultFormSetting, this.formSetting)
  },
  methods: {
    handleCheckedFieldsChange(values) {
      for (const field of Object.keys(this.iFormSetting.fieldsMeta)) {
        if (values.indexOf(field) === -1) {
          this.iFormSetting.fieldsMeta[field].hidden = () => true
        } else {
          this.iFormSetting.fieldsMeta[field].hidden = () => false
        }
      }
      this.internalKey++
    },
    getDefaultFormSetting() {
      const vm = this
      return {
        needGetObjectDetail: false,
        submitMethod: () => 'patch',
        cleanOtherFormValue: (formValue) => formValue,
        cleanFormValue: (value) => {
          const filterValue = {}
          Object.keys(value)
            .filter((key) => vm.checkedFields?.includes(key))
            .forEach((key) => {
              filterValue[key] = value[key]
            })
          let formValue = []
          let object = {}
          for (const row of vm.selectedRows) {
            object = Object.assign({}, filterValue, { id: row.id })
            formValue.push(object)
          }
          if (typeof this.iFormSetting.cleanOtherFormValue === 'function') {
            formValue = this.iFormSetting.cleanOtherFormValue(formValue)
          }
          return formValue
        },
        onSubmit: function(validValues) {
          const url = this.url
          const msg = this.updateSuccessMsg
          this.$axios.patch(url, validValues).then((res) => {
            vm.$emit('update')
            this.$message.success(msg)
            this.iVisible = false
          }).catch(error => {
            this.$emit('submitError', error)
            const response = error.response
            const data = response.data
            // 不要逐个设置字段的 attrs.error 或改动 fields 引用。
            // 这样会触发表单 content 重建，导致用户已输入的内容被覆盖/清空，
            // 且可能出现只能显示一个字段错误的现象。
            // 这里改为使用 AutoDataForm 暴露的 setErrors(errors) 覆盖式设置：
            // - 直接同步到 UI 的 el-form-item.validateMessage
            // - 支持同时显示多个字段错误
            // - 不修改 fields/attrs 引用，避免输入丢失
            if (response.status === 400 && data && typeof data === 'object') {
              this.$refs.form.setErrors(data)
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-row-divider {
    margin-bottom: 20px;
  }

  .select-prop-label {
    float: right;
    padding-right: 30px;
  }

  .tips {
    margin-bottom: 10px;
  }
</style>
