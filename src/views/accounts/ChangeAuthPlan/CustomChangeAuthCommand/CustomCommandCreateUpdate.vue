<template>
  <Page>
    <el-alert v-if="helpMessage" type="success">
      <span v-html="helpMessage" />
    </el-alert>
    <el-row :gutter="20">
      <el-col :span="14">
        <IBox>
          <GenericCreateUpdateForm v-bind="$data" @getObjectDone="getObjectDone" />
        </IBox>
      </el-col>
      <el-col :span="10">
        <DynamicInputField ref="DynamicInput" v-bind="$data" />
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import { GenericCreateUpdateForm, Page } from '@/layout/components'
import IBox from '@/components/IBox'
import { Select2, DynamicInputField } from '@/components/FormFields'
export default {
  name: 'CustomCommandCreateUpdate',
  components: {
    IBox,
    Page,
    GenericCreateUpdateForm,
    DynamicInputField
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/xpack/change-auth-plan/custom-auth-commands/`,
      fields: [
        [this.$t('common.Basic'), ['name', 'platform']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        name: {
          label: this.$t('common.Name'),
          require: true
        },
        platform: {
          component: Select2,
          helpText: this.$t('xpack.ChangeAuthPlan.CustomPlatformHelpText'),
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/platforms/?type=custom',
              transformOption: (item) => {
                return { label: `${item.name}`, value: item.id }
              }
            }
          }
        },
        comment: {
          label: this.$t('common.Comment')
        }
      },
      helpMessage: this.$t('xpack.ChangeAuthPlan.CustomCommandHelpMessage'),
      createSuccessNextRoute: { name: 'ChangeAuthPlanIndex' },
      updateSuccessNextRoute: { name: 'ChangeAuthPlanIndex' },
      cleanFormValue(data) {
        data['commands'] = vm.$refs.DynamicInput.dynamicValidateForm.commands.map(item => {
          return item.value
        })
        return data
      },
      onPerformError(error) {
        const response = error.response
        const data = response.data
        const errorMessage = data.commands.join(',')
        vm.$refs.DynamicInput.errorMessage = errorMessage
        vm.$message.error(errorMessage)
      },
      hasDetailInMsg: false
    }
  },
  methods: {
    getObjectDone(object) {
      this.$refs.DynamicInput.dynamicValidateForm.commands = object['commands'].map(item => {
        return { value: item }
      })
    }
  }
}
</script>

<style lang='less' scoped>
</style>
