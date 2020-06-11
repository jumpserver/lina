<template>
  <Dialog
    v-if="dialogSetting.dialogVisible"
    :title="this.$t('common.updateSelected')"
    :visible.sync="dialogSetting.dialogVisible"
    width="70%"
    top="1vh"
    :show-cancel="false"
    :show-confirm="false"
  >
    <el-row>
      <el-col :span="4">
        <label>{{ selectPropertiesLabel }}</label>
      </el-col>
      <el-col :span="18">
        <el-checkbox-group v-model="checkedFields" @change="handleCheckedFieldsChange">
          <el-checkbox v-for="(value, name) in iFormSetting.fieldsMeta" :key="name" :checked="true" :label="name">{{ value.label }}</el-checkbox>
        </el-checkbox-group>
      </el-col>
    </el-row>
    <el-row class="margin-bottom-20">
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
    dialogSetting: {
      type: Object,
      default: () => ({})
    },
    formSetting: {
      type: Object,
      default: () => ({})
    }
  },
  data: function() {
    return {
      internalKey: 0,
      selectPropertiesLabel: this.$t('common.SelectProperties'),
      checkedFields: [],
      iFormSetting: {}
    }
  },
  mounted() {
    const defaultFormSetting = this.getDefaultFormSetting()
    this.iFormSetting = Object.assign({}, this.formSetting, defaultFormSetting)
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
        getMethod: () => 'post',
        cleanFormValue: function(value) {
          const newValue = []
          let object = {}
          for (const row of vm.selectedRows) {
            object = Object.assign({}, value, { id: row.id })
            newValue.push(object)
          }
          return newValue
        },
        onSubmit: function(validValues) {
          const url = this.url
          const msg = this.updateSuccessMsg
          this.$axios.patch(url, validValues).then((res) => {
            this.$message.success(msg)
            vm.dialogSetting.dialogVisible = false
          }).catch(error => {
            this.$emit('submitError', error)
            const response = error.response
            const data = response.data
            if (response.status === 400) {
              for (const key of Object.keys(data)) {
                let value = data[key]
                if (value instanceof Array) {
                  value = value.join(';')
                }
                this.$refs.form.setFieldError(key, value)
              }
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .margin-bottom-20{
    margin-bottom: 20px;
  }

</style>
