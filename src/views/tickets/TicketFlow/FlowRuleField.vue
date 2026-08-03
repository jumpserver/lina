<template>
  <div class="flow-rule-field">
    <div v-for="(item, i) of approveData" :key="i">
      <el-card class="box-card">
        <template #header>
          <div class="clearfix">
            <span>{{ `${i + 1} ${$t('LevelApproval')}` }}</span>
          </div>
        </template>
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
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'

export default {
  components: {
    JSONManyToManySelect
  },
  // 根节点是 <div>。若不声明 emits / 关闭 inheritAttrs,DataForm 绑定的 onInput 等会落到根 div,
  // 内部单选按钮(值 all/ids/attrs)的原生 input 事件冒泡上来即触发表单更新,把字符串(如 "ids")
  // 当成整个 rules 的值(再经 cleanFormValue 的 slice 变成 "i"),污染 PUT 参数。
  inheritAttrs: false,
  emits: ['input'],
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
      rules: []
    }
  },
  computed: {
    approveData() {
      return this.getSortedRules()
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        this.syncRules(value)
      }
    },
    level: {
      handler() {
        this.resizeRules()
      }
    }
  },
  methods: {
    getSortedRules() {
      return [...this.rules].sort((a, b) => a.level - b.level)
    },
    getApprovalLevel() {
      return Math.min(Math.max(Number(this.level) || 1, 1), 5)
    },
    normalizeRules(value) {
      const level = this.getApprovalLevel()
      const source = Array.isArray(value) ? cloneDeep(value) : []
      const rules = source.slice(0, level).map((rule, index) => {
        const defaultRule = this.createDefaultRule(index + 1)
        return {
          level: index + 1,
          users: rule?.users || defaultRule.users
        }
      })
      while (rules.length < level) {
        rules.push(this.createDefaultRule(rules.length + 1))
      }
      return rules
    },
    syncRules(value) {
      const rules = this.normalizeRules(value)
      if (!isEqual(this.rules, rules)) {
        this.rules = rules
      }
    },
    resizeRules() {
      const level = Math.min(Math.max(Number(this.level) || 1, 1), 5)
      const valueRules = Array.isArray(this.value) ? this.value : []
      const source = valueRules.length > this.rules.length ? valueRules : this.rules
      this.rules = this.normalizeRules(source).slice(0, level)
      this.emitRules()
    },
    createDefaultRule(level) {
      return {
        level,
        users: {
          type: 'attrs',
          attrs: [
            {
              match: 'm2m',
              name: 'system_roles',
              value: ['00000000-0000-0000-0000-000000000001']
            }
          ]
        }
      }
    },
    handleInput(index, event) {
      const level = this.rules[index]?.level || index + 1
      this.rules.splice(index, 1, { level, users: cloneDeep(event) })
      this.emitRules()
    },
    emitRules() {
      this.$emit('input', cloneDeep(this.getSortedRules()))
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

// 根容器需占满表单项内容区(其父 .el-form-item__content 为 flex+align-items:flex-start,
// 不设宽度会按内容收缩,导致审批流程卡片无法 100%)
.flow-rule-field {
  width: 100%;
}

.box-card {
  width: 100%;
  margin-bottom: 10px;
  box-shadow: unset !important;

  :deep(.el-card__body) {
    padding: 10px 30px !important;
  }
}
</style>
