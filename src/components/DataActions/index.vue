<template>
  <div :class="grouped ? 'el-button-group' : 'el-button-ungroup'" class="layout">
    <template v-for="action in iActions">
      <el-dropdown
        v-if="action.dropdown"
        v-show="action.dropdown.length > 0"
        :key="action.name"
        class="action-item"
        placement="bottom-start"
        trigger="click"
        @command="handleDropdownCallback"
        v-on="$listeners"
      >
        <el-button :size="size" class="more-action" v-bind="cleanButtonAction(action)" @click="showDropdown=true">
          {{ action.title }} <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" style="overflow: auto;max-height: 60vh">
          <template v-if="showDropdown">
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
                v-if="option.has(action)"
                :key="option.name"
                :command="[option, action]"
                :disabled="!option.can(action)"
                v-bind="option"
              >
                <i v-if="option.fa" :class="'fa ' + option.fa" />
                {{ option.title }}
              </el-dropdown-item>
            </template>
          </template>
        </el-dropdown-menu>
      </el-dropdown>

      <el-button
        v-else
        :key="action.name"
        :size="size"
        class="action-item"
        v-bind="cleanButtonAction(action)"
        @click="handleClick(action)"
      >
        <el-tooltip :content="action.tip" :disabled="!action.tip" placement="top">
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
  data() {
    return {
      showDropdown: false
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
    handleDropdownVisibleChange(val) {
      this.$emit('dropdownVisibleChange', val)
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
      const df = () => true
      if (!item) {
        return df
      }
      const ok = item[attr]
      if (ok && typeof ok === 'function') {
        return ok
      } else if (ok == null) {
        return () => defaults === undefined ? true : defaults
      } else {
        return () => ok
      }
    },
    cleanButtonAction(action) {
      action = _.cloneDeep(action)
      delete action['dropdown']
      delete action['callback']
      delete action['name']
      // delete action['can']
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
        // const has = this.checkItem(action, 'has')
        // delete action['has']
        // if (!has) {
        //   continue
        // }
        // 是否有分割线
        action.has = this.checkItem(action, 'has')
        action.divided = false
        // action.divided = this.checkItem(action, 'divided', false)

        // 是否是disabled
        // const can = this.checkItem(action, 'can')
        // action.disabled = !can
        action.can = this.checkItem(action, 'can')

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

<style scoped>
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
</style>
