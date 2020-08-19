<template>
  <el-checkbox-group v-model="iValue" v-bind="$attrs" v-on="$listeners">
    <el-checkbox v-for="item in group" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
  </el-checkbox-group>
</template>

<script>
import i18n from '@/i18n/i18n'
export default {
  name: 'RoleCheckbox',
  components: {},
  props: {
    value: {
      type: [Array, Object],
      default: () => []
    },
    group: {
      type: [Array, Object],
      default: () =>
        [
          {
            label: i18n.t('users.OrgAdmin'),
            value: 'Admin'
          }, {
            label: i18n.t('users.OrgAuditor'),
            value: 'Auditor'
          }, {
            label: i18n.t('users.OrgUser'),
            value: 'User'
          }
        ]
    }
  },
  data() {
    return {
      iValue: this.value
    }
  }
}
</script>

<style lang='less' scoped>

</style>
