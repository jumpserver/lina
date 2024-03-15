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
      >
        <el-button :size="size" class="more-action" v-bind="cleanButtonAction(action)">
          <span v-if="action.icon" class="pre-icon">
            <i v-if="action.icon.startsWith('fa')" :class="'fa fa-fw ' + action.icon" />
            <svg-icon v-else :icon-class="action.icon" />
          </span>
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
              class="dropdown-item"
              v-bind="{...option, icon: ''}"
            >
              <span v-if="option.icon" class="pre-icon">
                <i v-if="option.icon.startsWith('fa')" :class="'fa fa-fw ' + option.icon" />
                <svg-icon v-else :icon-class="option.icon" />
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
        class="action-item"
        v-bind="{...cleanButtonAction(action), icon: action.icon && action.icon.startsWith('el-') ? action.icon : ''}"
        @click="handleClick(action)"
      >
        <el-tooltip :content="action.tip" :disabled="!action.tip" placement="top">
          <span>
            <span v-if="action.icon && !action.icon.startsWith('el-')" style="vertical-align: initial;">
              <i v-if="action.icon.startsWith('fa')" :class="'fa ' + action.icon" />
              <svg-icon v-else :icon-class="action.icon" />
            </span>
            {{ action.title }}
          </span>
        </el-tooltip>
      </el-button>
    </template>
  </div>
</template>

<script>
import { toSentenceCase } from '@/utils/common'

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
    hasIcon(action, type = '') {
      const icon = action.icon
      if (!icon) {
        return false
      }
      if (type) {
        return icon.startsWith(type)
      }
      return true
    },
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
    toSentenceCase(s) {
      return toSentenceCase(s)
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
        const action = { ...v }
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

.dropdown-item {
  .pre-icon {
    width: 17px;
    display: inline-block;
  }

  >>> i.fa {
    font-size: 13px;
    height: 13px;
    width: 13px;
    margin-right: 0;
  }

  >>> .svg-icon {
    font-size: 13px;
    height: 13px;
    width: 13px;
  }
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
