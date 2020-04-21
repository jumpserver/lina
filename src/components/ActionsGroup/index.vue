<template>
  <div :class="grouped ? 'el-button-group' : ''">
    <el-button v-for="item in validActions" :key="item.name" :size="size" v-bind="item" @click="handleClick(item.name)">
      <i v-if="item.fa" :class="'fa ' + item.fa" />{{ item.title }}
    </el-button>
    <el-dropdown v-if="validMoreActions.length > 0" trigger="click" @command="handleClick">
      <el-button :size="size" class="btn-more-actions">
        {{ this.$tc('More actions') }}<i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item in moreActions" :key="item.name" :command="item.name" v-bind="item" @click="handleClick(item.name)">{{ item.title }} </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'ActionsGroup',
  props: {
    grouped: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'small'
    },
    type: {
      type: String,
      default: ''
    },
    actions: {
      type: Array,
      default: () => []
    },
    moreActions: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    validActions() {
      return this.cleanActions(this.actions)
    },
    validMoreActions() {
      return this.cleanActions(this.moreActions)
    },
    totalActions() {
      return [...this.actions, ...this.moreActions]
    },
    totalNamedActions() {
      const actions = {}
      for (const action of this.totalActions) {
        if (!action || !action.hasOwnProperty('name')) {
          continue
        }
        actions[action.name] = action
      }
      return actions
    }
  },
  methods: {
    handleClick(item) {
      const action = this.totalNamedActions[item]
      if (action && action.callback) {
        action.callback(action)
      }
      this.$emit('actionClick', item)
    },
    checkItem(item, attr, defaults) {
      let ok = item[attr]
      if (typeof ok === 'function') {
        ok = ok(item)
      } else if (ok == null) {
        ok = defaults === undefined ? true : defaults
      }
      return ok
    },
    cleanActions(actions) {
      const cleanedActions = []
      for (const v of actions) {
        const action = _.cloneDeep(v)
        // 是否拥有这个action
        const has = this.checkItem(action, 'has')
        delete action['has']
        if (!has) {
          continue
        }
        // 是否是disabled
        const can = this.checkItem(action, 'can')
        delete action['can']
        action.disabled = !can
        cleanedActions.push(action)

        // 删掉callback，避免前台看到
        delete action['callback']
      }
      return cleanedActions
    }
  }

}
</script>

<style scoped>

</style>
