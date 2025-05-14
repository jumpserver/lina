<template>
  <div :class="grouped ? 'el-button-group' : 'el-button-ungroup'" class="layout">
    <template v-for="action in iActions">
      <el-dropdown
        v-if="action.dropdown"
        v-show="action.dropdown.length > 0"
        :key="action.name"
        :class="[action.name, {grouped: action.grouped }]"
        :size="action.size"
        :split-button="!!action.split"
        :type="action.type"
        class="action-item"
        placement="bottom-start"
        trigger="click"
        @click="handleClick(action)"
        @command="handleDropdownCallback"
      >
        <span v-if="action.split" :style="{ cursor: action.disabled ? 'not-allowed' : 'pointer' }">
          {{ action.title }}
        </span>
        <el-button
          v-else
          :class="action.name"
          :size="size"
          class="more-action"
          v-bind="{...cleanButtonAction(action), icon: ''}"
        >
          <span class="pre-icon">
            <Icon v-if="action.icon" :icon="action.icon" />
          </span>
          <span v-if="action.title">
            {{ action.title }}<i class="el-icon-arrow-down el-icon--right" />
          </span>
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
            <el-tooltip
              :key="option.name"
              :content="option.tip"
              :disabled="!option.tip"
              :open-delay="500"
              placement="top"
            >
              <el-dropdown-item
                :key="option.name"
                :command="[option, action]"
                :title="option.tip"
                class="dropdown-item"
                v-bind="{...option, icon: ''}"
              >
                <span v-if="actionsHasIcon(action.dropdown)" class="pre-icon">
                  <Icon v-if="option.icon" :icon="option.icon" />
                </span>
                {{ option.title }}
              </el-dropdown-item>
            </el-tooltip>
          </template>
        </el-dropdown-menu>
      </el-dropdown>

      <el-button
        v-else
        :key="action.name"
        :class="[action.name, {grouped: action.grouped }]"
        :size="size"
        class="action-item"
        v-bind="{...cleanButtonAction(action), icon: ''}"
        @click="handleClick(action)"
      >
        <el-tooltip :content="action.tip" :disabled="!action.tip" placement="top">
          <span>
            <span v-if="action.icon" style="vertical-align: initial">
              <Icon :icon="action.icon" />
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
import Icon from '@/components/Widgets/Icon/index.vue'

export default {
  name: 'DataActions',
  components: {
    Icon
  },
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
    actionsHasIcon(actions) {
      return actions.some(action => action.icon)
    },
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
      if (option.disabled) {
        return
      }
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
      if (action.disabled) {
        return
      }
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
      delete action['split']
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
        if (typeof can === 'string') {
          action.disabled = true
          action.tip = can
        } else {
          action.disabled = !can
        }
        delete action['can']

        if (!action.size) {
          action.size = 'small'
        }

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
$btn-text-color: #ffffff;
$color-btn-background: #E8F7F4;
$color-btn-focus-background: #83CBBA;
$color-divided: #E4E7ED;
$color-drop-menu-title: #909399;
$color-drop-menu-border: #e4e7ed;

// 通用
.layout {
  .action-item {
    margin-left: 5px;

    &.grouped {
      margin-left: 0;
    }

    &:first-child {
      margin-left: 0;
    }
  }

  .el-button.el-button--default {
    color: var(--color-text-primary) !important;
  }
}

// 主要是左侧 LeftSide
.layout.header-action {
  .action-item.el-dropdown {
    font-size: 11px;

    .more-action.el-button--default {
      ::v-deep .el-icon-arrow-down.el-icon--right {
        color: var(--color-icon-primary) !important;
      }
    }

    .el-button--primary {
      ::v-deep .el-icon-arrow-down.el-icon--right {
        color: #ffffff !important;
      }

      &.el-dropdown-selfdefine {
        border: none;
      }
    }
  }
}

// 主要是 Table 中的操作列
.layout.table-actions {
  display: flex;
  justify-content: center;
  align-items: flex-end;

  .el-button {
    padding: 2px 5px;

    &:not(.is-plain) {
      color: $btn-text-color;
    }

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    * {
      vertical-align: baseline !important;
    }
  }

  ::v-deep .action-item.el-dropdown .el-button {
    display: block;
    color: var(--color-primary);
    background-color: $color-btn-background;
    border-color: $color-btn-focus-background;

    &:focus {
      color: $btn-text-color;
      background-color: $color-btn-focus-background !important;
    }

    &:hover {
      color: $btn-text-color;
      background-color: $color-btn-focus-background;
    }
  }
}

// 下拉 options
.el-dropdown-menu {
  ::v-deep .more-batch-processing {

    &:hover {
      background-color: transparent !important;
    }

    &.el-dropdown-menu__item--divided {
      margin-top: 0;
      border-top: none;
      color: var(--color-text-primary);
      cursor: auto;
      font-size: 12px;
      line-height: 30px;
      border-bottom: 1px solid $color-divided;

      &:before {
        height: 0;
      }
    }
  }

  .dropdown-item {
    color: var(--color-text-primary);
    line-height: 34px;

    .pre-icon {
      width: 17px;
      display: inline-block;
    }

    ::v-deep i.fa {
      font-size: 13px;
      height: 13px;
      width: 13px;
      margin-right: 0;
    }

    ::v-deep .svg-icon {
      font-size: 13px;
      height: 13px;
      width: 13px;
    }
  }

  .el-dropdown-menu__item {
    padding: 0 20px;

    &.is-disabled {
      color: var(--color-disabled);
      cursor: not-allowed;
      pointer-events: auto;
    }

    &:not(.is-disabled):hover {
      background-color: var(--color-disabled-background);
    }
  }

  .dropdown-menu-title {
    text-align: left;
    font-size: 12px;
    color: $color-drop-menu-title;
    line-height: 30px;
    padding-left: 10px;
    padding-top: 10px;
    border-top: solid 1px $color-drop-menu-border;

    &:first-child {
      padding-top: 0;
      border-top: none;
    }
  }
}
</style>
