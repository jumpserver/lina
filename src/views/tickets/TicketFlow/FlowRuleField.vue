<template>
  <!-- 自定义组件 my-input -->
  <div>
    <div v-for="(item, i) of approveData" :key="i" style="margin-bottom: 10px">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ i + 1 + ' ' + vm.$t('tickets.LevelApproval') }}</span>
        </div>
        <el-radio-group v-model="item.strategy.value" @change="onChange()">
          <el-radio label="super_admin">{{ vm.$t('tickets.SuperAdmin') }}</el-radio>
          <el-radio label="org_admin">{{ vm.$t('tickets.OrgAdmin') }}</el-radio>
          <el-radio label="super_org_admin">{{ vm.$t('tickets.SuperOrgAdmin') }}</el-radio>
          <el-radio label="custom_user">{{ vm.$t('tickets.CustomUser') }}</el-radio>
        </el-radio-group>
        <br>
        <Select2 v-show="item.strategy.value === 'custom_user'" v-model="item.assignees" v-bind="select2Option" @change="onChange()" />
      </el-card>
    </div>
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2'

export default {
  components: {
    Select2
  },
  props: {
    value: {
      type: [String, Array],
      default: () => []
    },
    level: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      vm: this,
      defaultRule: [
        {
          strategy: {
            value: 'super_admin'
          },
          assignees_read_only: []
        }
      ],
      select2Option: {
        url: '/api/v1/users/users/?oid=root'
      },
      fields: [
      ]
    }
  },
  computed: {
    approveData() {
      let rules = []
      if (this.value.length === 2 && this.level === 1) {
        rules = this.value.slice(0, this.level)
      } else if (this.value.length === 1 && this.level === 2) {
        rules = this.value.concat(this.defaultRule)
      } else {
        rules = this.value
      }
      rules.forEach(rule => {
        if (rule.assignees_read_only) {
          rule['assignees'] = rule.assignees_read_only
          delete rule.assignees_read_only
        }
      })
      rules = rules.sort((a, b) => a.level - b.level)
      this.$emit('input', rules)
      return rules
    }
  },
  mounted() {
    this.$emit('input', this.approveData)
  },
  methods: {
    onChange() {
      this.$emit('input', this.approveData)
    }
  }
}
</script>

<style scoped>
  .text {
    font-size: 14px;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  }

  .item {
    padding: 18px 0;
  }

  .box-card {
    width: 600px;
  }
</style>
