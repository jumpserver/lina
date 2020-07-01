<template>
  <div :class="grouped ? 'el-button-group' : ''">
    <el-button v-for="item in iActions" :key="item.name" :size="size" v-bind="item" @click="handleClick(item.name)">
      <el-tooltip v-if="['actionExport', 'actionImport', 'actionRefresh'].indexOf(item.name) !== -1" effect="dark" :content="item.tip" placement="top">
        <i v-if="item.fa" :class="'fa ' + item.fa" />{{ item.title }}
      </el-tooltip>
      <span v-else>
        <i v-if="item.fa" :class="'fa ' + item.fa" />{{ item.title }}
      </span>
    </el-button>
    <el-dropdown v-if="iMoreActions.length > 0" trigger="click" @command="handleClick">
      <el-button :size="size" :type="moreActionsType" class="btn-more-actions">
        {{ iMoreActionsTitle }}<i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item in iMoreActions" :key="item.name" :command="item.name" v-bind="item" @click="handleClick(item.name)">{{ item.title }} </el-dropdown-item>
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
    },
    moreActionsTitle: {
      type: String,
      default() {
        return this.$t('common.MoreActions')
      }
    },
    moreActionsType: {
      type: String,
      default: 'default'
    }
  },
  computed: {
    iActions() {
      return this.cleanActions(this.actions)
    },
    iMoreActions() {
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
    },
    iMoreActionsTitle() {
      return this.moreActionsTitle || this.$t('common.MoreActions')
    }
  },
  methods: {
    handleClick(item) {
      const action = this.totalNamedActions[item]
      if (action && action.callback) {
        action.callback(action)
      } else {
        this.$log.debug('No callback found')
      }
      this.$emit('actionClick', item)
    },
    checkItem(item, attr, defaults) {
      if (!item) {
        return true
      }
      let ok = item[attr]
      if (ok && typeof ok === 'function') {
        ok = ok(item)
      } else if (ok == null) {
        ok = defaults === undefined ? true : defaults
      }
      return ok
    },
    cleanActions(actions) {
      const cleanedActions = []
      const cloneActions = _.cloneDeep(actions)
      for (const v of cloneActions) {
        if (!v) {
          continue
        }
        const action = Object.assign({}, v)
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
