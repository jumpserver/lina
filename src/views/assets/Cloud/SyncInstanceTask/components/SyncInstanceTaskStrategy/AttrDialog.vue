<template>
  <Dialog
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('common.Strategy')"
    v-bind="$attrs"
    width="80%"
    v-on="$listeners"
  >
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </Dialog>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import Dialog from '@/components/Dialog/index.vue'
import RuleInput from '@/views/assets/Cloud/Strategy/components/RuleInput'
import ActionInput from '@/views/assets/Cloud/Strategy/components/ActionInput'
import IBox from '@/components/IBox/index.vue'

export default {
  name: 'AttrDialog',
  components: { Dialog, GenericCreateUpdateForm, IBox },
  props: {
    value: {
      type: Object,
      default: () => ({ name: '', priority: 50, rule_relation: 'and', strategy_rules: [], strategy_actions: [] })
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      object: this.getObject(),
      fields: [
        [this.$t('common.BasicSetting'), ['name', 'priority']],
        [this.$t('common.RuleSetting'), ['rule_relation', 'strategy_rules']],
        [this.$t('common.ActionSetting'), ['strategy_actions']]
      ],
      fieldsMeta: {
        rule_relation: {
          label: this.$t('common.RuleRelation'),
          helpTips: this.$t('common.RuleRelationHelpTips')
        },
        strategy_rules: {
          label: this.$t('common.Rule'),
          component: RuleInput
        },
        strategy_actions: {
          label: this.$t('common.Action'),
          component: ActionInput
        }
      },
      hasSaveContinue: false,
      onPerformSuccess: (instance) => {
        const index = this.tableConfig.totalData.findIndex(x => x.id === instance.id)
        if (index !== -1) {
          this.tableConfig.totalData.splice(index, 1, instance)
        } else {
          this.tableConfig.totalData.push(instance)
        }
        this.$emit('confirm')
        this.$emit('update:visible', false)
      },
      getUrl: () => {
        const url = '/api/v1/xpack/cloud/strategies/'
        return this.object?.id ? `${url}${this.object.id}/` : url
      },
      submitMethod: () => {
        return this.object?.id ? 'put' : 'post'
      }
    }
  },
  methods: {
    getObject() {
      if (this.value?.id) {
        return {
          id: this.value.id, name: this.value.name, priority: this.value.priority,
          strategy_rules: this.value.strategy_rules, strategy_actions: this.value.strategy_actions,
          rule_relation: this.value.rule_relation
        }
      }
      return {}
    },
    handleAttrDelete(type, index) {
      return () => {
        const item = this.fieldsMeta[type].el.tableConfig.totalData.splice(index, 1)
        if (item[0]?.id) {
          this.$axios.delete(`/api/v1/xpack/cloud/${type}/${item[0]?.id}/`)
        }
        this.$message.success(this.$tc('common.deleteSuccessMsg'))
        this.object[type] = this.fieldsMeta[type].el.tableConfig.totalData
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form ::v-deep .el-form {
  margin-top: -15px;
}
</style>

