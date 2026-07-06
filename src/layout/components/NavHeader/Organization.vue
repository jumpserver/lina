<template>
  <el-select
    :disabled="disabled"
    :model-value="currentOrgId"
    :placeholder="$tc('Select')"
    class="org-select"
    :style="{ width: selectWidth }"
    filterable
    popper-class="switch-org"
    @change="changeOrg"
  >
    <template #prefix>
      <svg-icon icon-class="organization" />
    </template>

    <el-option-group
      v-for="group in orgGroups"
      :key="group.label"
      :label="group.label"
      class="option-group"
    >
      <el-option
        v-for="item in group.options"
        :key="item.id"
        :disabled="item.disabled"
        :label="item.name"
        :selected="item.id === currentOrg.id"
        :value="item.id"
      >
        <span v-if="item.icon" style="font-size: 15px; margin-right: 5px">
          <svg-icon :icon-class="item.icon" />
        </span>
        <span>{{ item.name }}</span>
      </el-option>
    </el-option-group>
  </el-select>
</template>

<script>
import { mapGetters } from 'vuex'
import orgUtil from '@/utils/jms/org'

export default {
  props: {
    isCollapse: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      orgOption: [],
      selectWidth: 'auto'
    }
  },
  computed: {
    ...mapGetters(['currentOrg', 'usingOrgs', 'currentViewRoute']),
    currentOrgDisplayName() {
      const currentOrgId = this.currentOrg?.id
      if (!currentOrgId) {
        return this.$tc('Select')
      }
      const matchedOrg = this.usingOrgs.find((item) => item.id === currentOrgId)
      if (matchedOrg?.name) {
        return matchedOrg.name
      }
      return this.currentOrg.name || this.$tc('Select')
    },
    orgActionsGroup() {
      const orgActions = {
        label: this.$t('OrganizationList'),
        options: [
          {
            id: 'create',
            icon: 'create',
            disabled: !this.$hasPerm('orgs.add_organization'),
            name: this.$t('OrganizationCreate')
          },
          {
            id: 'list',
            icon: 'list',
            disabled: !this.$hasPerm('orgs.view_organization'),
            name: this.$t('OrganizationManage')
          }
        ]
      }
      const hasPerms = this.$hasPerm('orgs.view_organization | orgs.add_organization')
      const isConsole = ['console'].includes(this.currentViewRoute.name)
      return hasPerms && isConsole ? orgActions : {}
    },
    orgChoicesGroup() {
      return {
        label: this.$t('ChangeOrganization'),
        options: this.usingOrgs
      }
    },
    orgGroups() {
      return [this.orgActionsGroup, this.orgChoicesGroup]
    },
    currentOrgId() {
      const usingOrgIds = this.usingOrgs.map((o) => o.id)
      let currentOrgId = this.currentOrg?.id
      const find = usingOrgIds.indexOf(currentOrgId) > -1
      if (!find) {
        currentOrgId = null
      }
      return currentOrgId
    }
  },
  watch: {
    currentOrgDisplayName() {
      this.updateWidth()
    }
  },
  mounted() {
    this.updateWidth()
  },
  methods: {
    updateWidth() {
      this.$nextTick(() => {
        // 创建临时元素来测量文本宽度
        const tempSpan = document.createElement('span')
        tempSpan.style.visibility = 'hidden'
        tempSpan.style.position = 'absolute'
        tempSpan.style.whiteSpace = 'nowrap'
        tempSpan.style.fontSize = '14px'
        tempSpan.style.fontFamily =
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        tempSpan.style.fontWeight = 'normal'
        tempSpan.style.letterSpacing = 'normal'

        // 获取当前组织显示名称
        const orgName = this.currentOrgDisplayName

        tempSpan.textContent = orgName
        document.body.appendChild(tempSpan)

        // 测量文本宽度
        const textWidth = tempSpan.offsetWidth

        // 固定空间：左侧图标 + padding + 右侧箭头
        const iconWidth = 18
        const paddingWidth = 48
        const arrowWidth = 24
        const totalWidth = textWidth + iconWidth + paddingWidth + arrowWidth

        // 设置合理的边界
        const minWidth = 180
        const maxWidth = 360
        const finalWidth = Math.max(minWidth, Math.min(maxWidth, totalWidth))

        this.selectWidth = finalWidth + 'px'

        // 清理临时元素
        document.body.removeChild(tempSpan)
      })
    },
    changeOrg(orgId) {
      const org = this.usingOrgs.find((item) => item.id === orgId)

      switch (orgId) {
        case 'create':
          this.$router.push({ name: 'OrganizationCreate' })
          break
        case 'list':
          this.$router.push({ name: 'OrganizationList' })
          break
        default:
          if (!org) {
            return
          }
          orgUtil.changeOrg(org, true, this)
      }
      this.updateWidth()
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

$height: 28px;

.org-select {
  display: flex;
  align-items: center;
  line-height: $height;

  :deep(.el-select__wrapper) {
    width: 100%;
    min-height: 32px;
    padding: 0 12px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    transition:
      background-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  :deep(.el-select__wrapper.is-hovering:not(.is-focused)),
  :deep(.el-select__wrapper.is-focused) {
    background: rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  :deep(.el-select__wrapper.is-disabled) {
    background: rgba(255, 255, 255, 0.06);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  :deep(.el-select__prefix),
  :deep(.el-select__suffix) {
    color: rgba(255, 255, 255, 0.82);
  }

  :deep(.el-select__selection) {
    min-width: 0;
  }

  :deep(.el-select__selected-item),
  :deep(.el-select__placeholder) {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #fff;
  }

  :deep(.el-select__placeholder.is-transparent) {
    color: rgba(255, 255, 255, 0.72);
  }

  :deep(.el-select__caret),
  :deep(.svg-icon) {
    color: #fff !important;
  }
}

.el-select-dropdown.switch-org {
  border-radius: 4px;
  left: 220px !important;
  max-width: 400px;

  .option-group {
    padding-right: 8px;
    padding-left: 8px;
    max-width: 400px;

    :deep(.el-select-group__title) {
      color: var(--color-icon-primary);
      padding-left: 15px;
      font-size: 12px;
      line-height: 30px;
    }

    :deep(.el-select-dropdown__item) {
      padding: 0 15px;
      line-height: 30px;
      height: 30px;
    }
  }
}

.icon {
  cursor: pointer;
}

.line {
  width: 1px;
  margin-left: 5px;
  border: 0.5px solid #fff;
  opacity: 0.4;
}
</style>
