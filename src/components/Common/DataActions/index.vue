<template>
  <div :class="grouped ? 'el-button-group' : 'el-button-ungroup'" class="layout">
    <template v-for="action in iActions" :key="action.name">
      <el-dropdown
        v-if="action.dropdown"
        v-show="action.dropdown.length > 0"
        :class="[action.name, { grouped: action.grouped }]"
        :popper-class="action.popperClass"
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
        <el-button v-bind="{ ...cleanButtonAction(action), icon: '' }" v-else
          :class="action.name"
          :size="size"
          class="more-action">
          <Icon v-if="action.icon" :icon="action.icon" class="pre-icon" />
          <span v-if="action.title">
            {{ action.title }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
        </el-button>

        <template #dropdown>
          <el-dropdown-menu style="overflow: auto; max-height: 60vh">
            <template v-for="option in action.dropdown" :key="option.name">
              <div v-if="option.group" class="dropdown-menu-title" style="width: 130px">
                {{ option.group }}
              </div>
              <el-tooltip
                :content="option.tip"
                :disabled="!option.tip"
                :open-delay="500"
                placement="top"
              >
                <el-dropdown-item v-bind="{ ...option, icon: '' }" :key="option.name"
                  :command="[option, action]"
                  :title="option.tip"
                  class="dropdown-item">
                  <span v-if="actionsHasIcon(action.dropdown)" class="pre-icon">
                    <Icon v-if="option.icon" :icon="option.icon" />
                  </span>
                  {{ option.title }}
                </el-dropdown-item>
              </el-tooltip>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button v-bind="{ ...cleanButtonAction(action), icon: '' }" v-else
        :class="[action.name, { grouped: action.grouped }]"
        :size="size"
        class="action-item"
        @click="handleClick(action)">
        <el-tooltip :content="action.tip" :disabled="!action.tip" placement="top">
          <div>
            <Icon v-if="action.icon" :icon="action.icon" class="pre-icon" />
            <span>
              {{ action.title }}
            </span>
          </div>
        </el-tooltip>
      </el-button>
    </template>
  </div>
</template>

<script>
import { toSentenceCase } from '@/utils/common/index'
import { ArrowDown } from '@element-plus/icons-vue'
import Icon from '@/components/Widgets/Icon/index.vue'

export default {
  name: 'DataActions',
  components: {
    Icon,
    ArrowDown
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
      // 只保留 el-button 接受的属性,避免非法 prop 传入导致 validator 报错
      const { type, size, disabled, plain, round, circle, link, loading } = action
      return { type, size, disabled, plain, round, circle, link, loading }
    },
    cleanActions(actions) {
      const cleanedActions = []
      const cloneActions = actions.map(v => v ? { ...v } : v)
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
$color-btn-background: #e8f7f4;
$color-btn-focus-background: #83cbba;
$color-divided: #e4e7ed;
$color-drop-menu-title: #909399;
$color-drop-menu-border: #e4e7ed;

// 通用
.layout {
  // 确保所有按钮都使用 flex 布局，内容垂直居中
  :deep(.el-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;

    // 确保按钮内部内容垂直居中
    > span {
      display: inline-flex;
      align-items: center;
      line-height: 1;
    }
  }

  .action-item {
    margin-left: 5px;

    .pre-icon + span {
      margin-left: 3px;
    }

    &.grouped {
      margin-left: 0;
    }

    &:first-child {
      margin-left: 0;
    }
  }
}

// 主要是左侧 LeftSide
.layout.header-action {
  :deep(.action-item.el-button),
  :deep(.action-item.el-dropdown > .el-button),
  :deep(.action-item.el-dropdown .el-button-group .el-button) {
    min-height: 30px;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.3;
  }

  .action-item.el-dropdown {
    font-size: 12px;

    // 确保下拉按钮也垂直居中
    :deep(.el-button) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    :deep(.el-button-group) {
      display: inline-flex;
      align-items: stretch;
    }

    .more-action.el-button--default {
      :deep(.el-icon-arrow-down.el-icon--right) {
        color: var(--color-icon-primary) !important;
      }
    }

    :deep(.el-button--primary.is-plain),
    :deep(.more-action.el-button--primary.is-plain) {
      color: var(--color-primary);
      background-color: var(--color-primary-light-3, #e8f7f4);
      border-color: var(--color-primary-light-1, var(--color-primary));

      &:hover,
      &:focus {
        color: var(--color-primary);
        background-color: var(--color-primary-light-3, #e8f7f4);
        border-color: var(--color-primary-light-1, var(--color-primary));
      }
    }

    .el-button--primary {
      :deep(.el-icon-arrow-down.el-icon--right) {
        color: #ffffff !important;
      }

      &.el-dropdown-selfdefine {
        border: none;
      }
    }
  }
}

:global(.table-action-dropdown.el-dropdown__popper .el-dropdown-menu--small) {
  padding: 6px 0;
}

:global(.table-action-dropdown.el-dropdown__popper .el-dropdown-menu__item) {
  padding: 0 20px;
  font-size: 13px;
}
</style>
