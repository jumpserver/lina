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
      selectWidth: '128px'
    }
  },
  computed: {
    ...mapGetters(['currentOrg', 'usingOrgs', 'currentViewRoute']),
    currentOrgDisplayName() {
      const currentOrgId = this.currentOrg?.id
      if (!currentOrgId) {
        return this.$tc('Select')
      }
      const matchedOrg = this.usingOrgs.find(item => item.id === currentOrgId)
      if (matchedOrg?.name) {
        return matchedOrg.name
      }
      return this.currentOrg?.name || this.$tc('Select')
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
      const isConsole = ['console'].includes(this.currentViewRoute?.name)
      return hasPerms && isConsole ? orgActions : {}
    },
    orgChoicesGroup() {
      return {
        label: this.$t('ChangeOrganization'),
        options: this.usingOrgs || []
      }
    },
    orgGroups() {
      return [this.orgActionsGroup, this.orgChoicesGroup].filter(group => {
        return group?.options?.length
      })
    },
    currentOrgId() {
      const usingOrgIds = (this.usingOrgs || []).map(o => o.id)
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
        tempSpan.style.fontFamily = 'Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif'
        tempSpan.style.fontWeight = 'normal'
        tempSpan.style.letterSpacing = 'normal'

        // 获取当前组织显示名称
        const orgName = this.currentOrgDisplayName

        tempSpan.textContent = orgName
        document.body.appendChild(tempSpan)

        // 测量文本宽度
        const textWidth = tempSpan.offsetWidth

        // 固定空间：左侧图标 + padding + 右侧箭头
        const iconWidth = 15 // 左侧图标
        const paddingWidth = 35 // 左右 padding
        const arrowWidth = 20 // 右侧箭头
        const totalWidth = textWidth + iconWidth + paddingWidth + arrowWidth

        // 设置合理的边界
        const minWidth = 128
        const maxWidth = 400
        const finalWidth = Math.max(minWidth, Math.min(maxWidth, totalWidth))

        this.selectWidth = finalWidth + 'px'

        // 清理临时元素
        document.body.removeChild(tempSpan)
      })
    },
    changeOrg(orgId) {
      const org = (this.usingOrgs || []).find(item => item.id === orgId)

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

$height: 32px;

.org-select {
  display: inline-flex;
  align-items: center;
  width: 100% !important;
  height: $height;
  line-height: 1;
  vertical-align: middle;

  :deep(.el-select__wrapper) {
    align-items: center;
    width: 100%;
    min-height: $height;
    height: $height;
    padding: 0 var(--space-2);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--radius-control);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: none;
    color: #fff;
    line-height: 1;
    transition:
      background-color var(--duration-fast) var(--ease-standard),
      border-color var(--duration-fast) var(--ease-standard);

    &:hover {
      border-color: rgba(255, 255, 255, 0.22);
      background: rgba(255, 255, 255, 0.16);
    }
  }

  :deep(.el-select__wrapper.is-filterable),
  :deep(.el-tooltip__trigger),
  :deep(.el-select__wrapper.is-filterable.el-tooltip__trigger) {
    width: 100%;
  }

  :deep(.el-select__prefix),
  :deep(.el-select__suffix) {
    display: inline-flex;
    align-items: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.88);
  }

  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item),
  :deep(.el-select__selected-item span) {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    color: #fff;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    line-height: 1;
  }

  :deep(.el-select__caret),
  :deep(.el-icon),
  :deep(.svg-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size-base);
    height: var(--icon-size-base);
    color: rgba(255, 255, 255, 0.88);
    font-size: var(--icon-size-base);
    font-style: normal;
    line-height: var(--icon-size-base);
  }
}

:deep(.el-input) {
  .el-input__inner {
    height: $height;
    line-height: $height;
    background: none;
    border: none;
    padding-left: 20px;
  }

  .el-input__prefix {
    left: 0;
  }

  .el-input__suffix > .el-input__suffix-inner i {
    color: #fff;
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

.org-select :deep(.el-input.is-disabled .el-input__inner) {
  color: #ffffff !important;
  background-color: transparent;
}

.org-select :deep(.el-select__wrapper.is-disabled) {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.08);
  cursor: not-allowed;
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
