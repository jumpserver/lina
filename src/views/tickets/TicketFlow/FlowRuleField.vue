<template>
  <div>
    <div v-for="(item, i) of approveData" :key="i">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{ `${i + 1} ${$t('LevelApproval')}` }}</span>
        </div>
        <JSONManyToManySelect
          :value="item.users"
          :resource="userComponentMeta.el.resource"
          :select2="userComponentMeta.el.select2"
          :attrs="userComponentMeta.el.attrs"
          @input="handleInput(i, $event)"
        />
      </el-card>
    </div>
  </div>
</template>

<script>
import { JSONManyToManySelect } from '@/components/Form/FormFields'
import { userJSONSelectMeta } from '@/views/users/const'

export default {
  components: {
    JSONManyToManySelect
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
      userComponentMeta: userJSONSelectMeta(this),
      defaultRule: [
        {
          users: {
            type: 'attrs',
            attrs: [
              {
                match: 'm2m',
                name: 'system_roles',
                'value': ['00000000-0000-0000-0000-000000000001']
              }
            ]
          }
        }
      ],
      rules: []
    }
  },
  computed: {
    approveData() {
      return this.getSortedRules()
    }
  },
  watch: {
    level: {
      handler() {
        this.updateApproveData()
      }
    }
  },
  mounted() {
    this.updateApproveData()
  },
  methods: {
    getSortedRules() {
      return [...this.rules].sort((a, b) => a.level - b.level)
    },
    updateApproveData() {
      let rules = [...this.value]
      if (this.value.length === 2 && this.level === 1) {
        rules = this.value.slice(0, this.level)
      } else if (this.value.length === 1 && this.level === 2) {
        rules = this.value.concat(this.defaultRule)
      }
      this.rules = rules
      this.$emit('input', this.rules)
    },
    handleInput(index, event) {
      this.$set(this.rules, index, { 'users': event })
      this.$emit('input', this.rules)
    }
  }
}
</script>

<style scoped lang="scss">
  .text {
    font-size: 14px;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  }

  .item {
    padding: 10px 0;
  }

  .box-card {
    width: 96%;
    margin-bottom: 10px;
    box-shadow: unset !important;

    ::v-deep .el-card__body {
      padding: 10px 30px !important;
    }
  }
</style>
