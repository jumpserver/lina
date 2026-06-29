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
        <el-button
          v-bind="{ ...cleanButtonAction(action), icon: '' }"
          v-else
          :class="action.name"
          :size="size"
          class="more-action"
        >
          <Icon v-if="action.icon" :icon="action.icon" class="pre-icon" />
          <span v-if="action.title">
            {{ action.title }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
        </el-button>

        <template #dropdown>
          <el-dropdown-menu style="overflow: auto; max-height: 60vh">
            <template v-for="option in action.dropdown" :key="option.name">
              <div v-if="option.group" class="dropdown-menu-title">
                {{ option.group }}
              </div>
              <el-dropdown-item
                v-bind="{ ...option, icon: '' }"
                :command="[option, action]"
                :title="option.tip"
                class="dropdown-item"
              >
                <el-tooltip
                  :content="option.tip"
                  :disabled="!option.tip"
                  :open-delay="500"
                  placement="top"
                >
                  <div class="dropdown-item__content">
                    <span v-if="actionsHasIcon(action.dropdown)" class="pre-icon">
                      <Icon v-if="option.icon" :icon="option.icon" />
                    </span>
                    <span class="dropdown-item__label">{{ option.title }}</span>
                  </div>
                </el-tooltip>
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button
        v-bind="{ ...cleanButtonAction(action), icon: '' }"
        v-else
        :class="[action.name, { grouped: action.grouped }]"
        :size="size"
        class="action-item"
        @click="handleClick(action)"
      >
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
      return actions.some((action) => action.icon)
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
      const cloneActions = actions.map((v) => (v ? { ...v } : v))
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
          action.popperClass = [action.popperClass, 'action-dropdown'].filter(Boolean).join(' ')
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

  :deep(.action-item.el-dropdown > .el-button.more-action),
  :deep(.action-item.el-dropdown .el-button-group .el-button.more-action) {
    --el-button-hover-text-color: var(--color-primary) !important;
    --el-button-hover-bg-color: var(--color-primary-light-3, #e8f7f4) !important;
    --el-button-hover-border-color: var(--color-primary-light, #bae8df) !important;
    --el-button-active-text-color: var(--color-primary) !important;
    --el-button-active-bg-color: var(--color-primary-light-3, #e8f7f4) !important;
    --el-button-active-border-color: var(--color-primary-light, #bae8df) !important;
  }

  :deep(.action-item.el-button.el-button--default),
  :deep(.action-item.el-dropdown > .el-button.el-button--default),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default),
  :deep(.action-item.el-button.el-button--primary.is-plain),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--primary.is-plain) {
    --el-button-hover-text-color: var(--color-primary);
    --el-button-hover-bg-color: var(--color-primary-light-3, #e8f7f4);
    --el-button-hover-border-color: var(--color-primary-light, #bae8df);
    --el-button-active-text-color: var(--color-primary);
    --el-button-active-bg-color: var(--color-primary-light-3, #e8f7f4);
    --el-button-active-border-color: var(--color-primary-light, #bae8df);

    &:hover,
    &:focus,
    &:active {
      color: var(--color-primary);
      background-color: var(--color-primary-light-3, #e8f7f4) !important;
      border-color: var(--color-primary-light, #bae8df) !important;
      box-shadow: none !important;
      outline: none;
    }
  }

  :deep(.action-item.el-button.el-button--default .pre-icon),
  :deep(.action-item.el-button.el-button--default .el-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--default .pre-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--default .el-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default .pre-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default .el-icon) {
    color: var(--color-icon-primary);
  }

  :deep(.action-item.el-button.el-button--default:hover .pre-icon),
  :deep(.action-item.el-button.el-button--default:hover .el-icon),
  :deep(.action-item.el-button.el-button--default:focus .pre-icon),
  :deep(.action-item.el-button.el-button--default:focus .el-icon),
  :deep(.action-item.el-button.el-button--default:active .pre-icon),
  :deep(.action-item.el-button.el-button--default:active .el-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--default:hover .pre-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--default:hover .el-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--default:focus .pre-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--default:focus .el-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--default:active .pre-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--default:active .el-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default:hover .pre-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default:hover .el-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default:focus .pre-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default:focus .el-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default:active .pre-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--default:active .el-icon) {
    color: var(--color-primary);
  }

  :deep(.action-item.el-button.el-button--primary.is-plain .pre-icon),
  :deep(.action-item.el-button.el-button--primary.is-plain .el-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain .pre-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain .el-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--primary.is-plain .pre-icon),
  :deep(.action-item.el-dropdown .el-button-group .el-button.el-button--primary.is-plain .el-icon) {
    color: var(--color-primary);
  }

  :deep(.action-item.el-button.el-button--primary.is-plain:hover .pre-icon),
  :deep(.action-item.el-button.el-button--primary.is-plain:hover .el-icon),
  :deep(.action-item.el-button.el-button--primary.is-plain:focus .pre-icon),
  :deep(.action-item.el-button.el-button--primary.is-plain:focus .el-icon),
  :deep(.action-item.el-button.el-button--primary.is-plain:active .pre-icon),
  :deep(.action-item.el-button.el-button--primary.is-plain:active .el-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain:hover .pre-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain:hover .el-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain:focus .pre-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain:focus .el-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain:active .pre-icon),
  :deep(.action-item.el-dropdown > .el-button.el-button--primary.is-plain:active .el-icon),
  :deep(
    .action-item.el-dropdown .el-button-group .el-button.el-button--primary.is-plain:hover .pre-icon
  ),
  :deep(
    .action-item.el-dropdown .el-button-group .el-button.el-button--primary.is-plain:hover .el-icon
  ),
  :deep(
    .action-item.el-dropdown .el-button-group .el-button.el-button--primary.is-plain:focus .pre-icon
  ),
  :deep(
    .action-item.el-dropdown .el-button-group .el-button.el-button--primary.is-plain:focus .el-icon
  ),
  :deep(
    .action-item.el-dropdown
      .el-button-group
      .el-button.el-button--primary.is-plain:active
      .pre-icon
  ),
  :deep(
    .action-item.el-dropdown .el-button-group .el-button.el-button--primary.is-plain:active .el-icon
  ) {
    color: var(--color-primary);
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

:global(.action-dropdown.el-dropdown__popper .el-dropdown-menu--small) {
  padding: 6px 0;
}

// 下拉分组标题（如「数据库类型」）：与下拉项同样 0 20px 的左右内边距，分组上方加分隔线，
// 文字垂直居中、次要色，区别于可点击项。
:global(.action-dropdown.el-dropdown__popper .dropdown-menu-title) {
  display: flex;
  align-items: center;
  height: 30px;
  margin-top: 6px;
  padding: 0 20px;
  font-size: 12px;
  color: var(--color-text-secondary, #909399);
  border-top: 1px solid #e4e7ed;
}

:global(.action-dropdown.el-dropdown__popper .dropdown-menu-title:first-child) {
  margin-top: 0;
  border-top: none;
}

:global(.action-dropdown.el-dropdown__popper .el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  height: 34px;
  line-height: 34px;
  padding: 0 20px;
  font-size: 13px;
}

:global(.action-dropdown.el-dropdown__popper .el-dropdown-menu__item .pre-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  margin-right: 8px;
}

:global(.action-dropdown.el-dropdown__popper .el-dropdown-menu__item .dropdown-item__label) {
  min-width: 0;
}

:global(
  .action-dropdown.el-dropdown__popper .more-batch-processing.el-dropdown-menu__item--divided
) {
  position: relative;
  margin-top: 8px;
  color: var(--color-text-primary);
  cursor: default;
  font-size: 12px;
}

:global(
  .action-dropdown.el-dropdown__popper .more-batch-processing.el-dropdown-menu__item--divided:before
) {
  top: -8px;
  left: 12px;
  right: 12px;
  height: 1px;
  background-color: #e4e7ed;
}

:global(
  .action-dropdown.el-dropdown__popper .more-batch-processing.el-dropdown-menu__item--divided:hover
) {
  background-color: transparent;
}
</style>
