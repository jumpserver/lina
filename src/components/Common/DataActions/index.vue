<template>
  <div :class="grouped ? 'el-button-group' : 'el-button-ungroup'" class="data-actions layout">
    <template v-for="action in iActions" :key="action.name">
      <el-dropdown
        v-if="action.dropdown"
        v-show="action.dropdown.length > 0"
        :class="[action.name, { grouped: action.grouped }]"
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
          v-bind="{ ...cleanButtonAction(action), icon: '' }"
          :class="action.name"
          :size="size"
          class="more-action"
        >
          <span class="action-content">
            <Icon v-if="action.icon" :icon="action.icon" class="pre-icon" />
            <span v-if="action.title" class="action-label">
              {{ action.title }}
            </span>
            <el-icon v-if="action.title" class="action-caret">
              <ArrowDown />
            </el-icon>
          </span>
        </el-button>

        <template #dropdown>
          <el-dropdown-menu>
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
                <span class="dropdown-item-content">
                  <span v-if="actionsHasIcon(action.dropdown)" class="pre-icon">
                    <Icon v-if="option.icon" :icon="option.icon" />
                  </span>
                  <span class="action-label">{{ option.title }}</span>
                </span>
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button
        v-else
        v-bind="{ ...cleanButtonAction(action), icon: '' }"
        :class="[action.name, { grouped: action.grouped }]"
        :size="size"
        class="action-item"
        @click="handleClick(action)"
      >
        <el-tooltip :content="action.tip" :disabled="!action.tip" placement="top">
          <span class="action-content">
            <Icon v-if="action.icon" :icon="action.icon" class="pre-icon" />
            <span class="action-label">
              {{ action.title }}
            </span>
          </span>
        </el-tooltip>
      </el-button>
    </template>
  </div>
</template>

<script>
import Icon from '@/components/Widgets/Icon/index.vue'
import { toSentenceCase } from '@/utils/common/index'
import { ArrowDown } from '@element-plus/icons-vue'

export default {
  name: 'DataActions',
  components: {
    ArrowDown,
    Icon
  },
  props: {
    grouped: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'default'
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
          action.size = 'default'
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
.data-actions.layout {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-style: normal;

  .action-item {
    display: inline-flex;
    align-items: center;
    margin-left: 0;
    font-style: normal;
  }

  :deep(.el-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-style: normal;
  }

  :deep(.el-button > span) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    line-height: 1;
  }
}

.action-content,
.dropdown-item-content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
  font-style: normal;
  line-height: 1;
}

.action-label {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  font-style: normal;
  line-height: 1;
}

.pre-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 var(--icon-size-base);
  width: var(--icon-size-base);
  height: var(--icon-size-base);
  font-style: normal;
  line-height: var(--icon-size-base);

  :deep(.svg-icon),
  :deep(.el-icon),
  :deep([class^='el-icon-']),
  :deep([class*=' el-icon-']),
  :deep(.fa),
  :deep(i) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size-base);
    height: var(--icon-size-base);
    margin-right: 0 !important;
    font-size: var(--icon-size-base);
    font-style: normal;
    line-height: var(--icon-size-base);
  }
}
</style>
