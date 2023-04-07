<template>
  <div :class="grouped ? 'el-button-group' : 'el-button-ungroup'" class="layout">
    <template v-for="action in iActions">
      <el-dropdown
        v-if="action.dropdown"
        v-show="action.dropdown.length > 0"
        :key="action.name"
        class="action-item"
        trigger="click"
        placement="bottom-start"
        @command="handleDropdownCallback"
      >
        <el-button class="more-action" :size="size" v-bind="cleanButtonAction(action)">
          {{ action.title }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" style="overflow: auto;max-height: 60vh">
          <template v-for="option in action.dropdown">
            <div
              v-if="option.group"
              :key="'group:'+option.name"
              class="dropdown-menu-title"
              style="width:130px"
            >
              {{ option.group }}
            </div>
            <el-dropdown-item
              :key="option.name"
              :command="[option, action]"
              v-bind="option"
            >
              <span v-if="option.fa">
                <i v-if="option.fa.startsWith('fa-')" :class="'fa ' + option.fa" />
                <svg-icon v-else :icon-class="option.fa" style="font-size: 14px; margin-right: 2px; margin-left: -2px;" />
              </span>
              {{ option.title }}
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>

      <el-button
        v-else
        :key="action.name"
        :size="size"
        v-bind="cleanButtonAction(action)"
        class="action-item"
        @click="handleClick(action)"
      >
        <el-tooltip :disabled="!action.tip" :content="action.tip" placement="top">
          <span>
            <span v-if="action.fa" style="vertical-align: initial;">
              <i v-if="action.fa.startsWith('fa-')" :class="'fa ' + action.fa" />
              <svg-icon v-else :icon-class="action.fa" style="font-size: 14px;" />
            </span>
            {{ action.title }}
          </span>
        </el-tooltip>
      </el-button>
    </template>
  </div>
</template>

<script>

export default {
  name: 'DataActions',
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
    }
  },
  computed: {
    iActions() {
      return this.cleanActions(this.actions)
    }
  },
  methods: {
    handleDropdownCallback(command) {
      const [option, dropdown] = command
      const defaultCallback = () => this.$log.debug('No callback found: ', option, dropdown)
      let callback = option.callback
      if (!callback) {
        callback = dropdown.callback
      }
      if (!callback) {
        callback = defaultCallback
      }
      return callback(option)
    },
    handleClick(action) {
      if (action && action.callback) {
        action.callback(action)
      } else {
        this.$log.debug('No callback found')
      }
      this.$emit('actionClick', action)
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
    cleanButtonAction(action) {
      action = _.cloneDeep(action)
      delete action['dropdown']
      delete action['callback']
      delete action['name']
      delete action['can']
      return action
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
        // 是否有分割线
        action.divided = this.checkItem(action, 'divided', false)

        // 是否是disabled
        const can = this.checkItem(action, 'can')
        action.disabled = !can

        if (action.dropdown) {
          // const dropdown = this.cleanActions(action.dropdown)
          action.dropdown = this.cleanActions(action.dropdown)
        }
        cleanedActions.push(action)
      }
      return cleanedActions
    }
  }
}
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  justify-content: center;
}

.dropdown-menu-title {
  text-align: left;
  font-size: 12px;
  color: #909399;
  line-height: 30px;
  padding-left: 10px;
  padding-top: 10px;
  border-top: solid 1px #e4e7ed;
}

.dropdown-menu-title:first-child {
  padding-top: 0;
  border-top: none;
}

.el-button-ungroup .action-item {
  margin-left: 4px;
}

.el-button-ungroup .action-item:first-child {
  margin-left: 0;
}
::v-deep .more-batch-processing {
  &.el-dropdown-menu__item--divided {
    margin-top: 0;
    border-top: none;
    color: #909399;
    cursor: auto;
    font-size: 12px;
    line-height: 30px;
    border-bottom: 1px solid #E4E7ED;
    &:before {
      height: 0;
    }
  }
  &.el-dropdown-menu__item:not(.is-disabled):hover {
    color: #909399;
    background-color: #FFFFFF;
  }
}
</style>
