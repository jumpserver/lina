<template>
  <el-select
    :disabled="disabled"
    :placeholder="$tc('Select')"
    :value="currentOrgId"
    class="org-select"
    filterable
    popper-class="switch-org"
    @change="changeOrg"
  >
    <template slot="prefix">
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
        <span v-if="item.icon" style="font-size: 15px; margin-right: 5px;">
          <svg-icon :icon-class="item.icon" />
        </span>
        <span>{{ item.name }}</span>
      </el-option>
    </el-option-group>
  </el-select>
</template>

<script>
import { mapGetters } from 'vuex'
import orgUtil from '@/utils/org'

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
      orgOption: []
    }
  },
  computed: {
    ...mapGetters([
      'currentOrg',
      'usingOrgs',
      'currentViewRoute'
    ]),
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
      const isConsole = this.currentViewRoute.name === 'console'
      return hasPerms && isConsole ? orgActions : {}
    },
    orgChoicesGroup() {
      return {
        label: this.$t('ChangeOrganization'),
        options: this.usingOrgs
      }
    },
    orgGroups() {
      return [
        this.orgActionsGroup,
        this.orgChoicesGroup
      ]
    },
    currentOrgId() {
      const usingOrgIds = this.usingOrgs.map(o => o.id)

      let currentOrgId = this.currentOrg.id

      const find = usingOrgIds.indexOf(currentOrgId) > -1

      if (!find) {
        currentOrgId = null
      }
      return currentOrgId
    }
  },
  methods: {
    changeOrg(orgId) {
      const org = this.usingOrgs.find(item => item.id === orgId)

      switch (orgId) {
        case 'create':
          this.$router.push({ name: 'OrganizationCreate' })
          break
        case 'list':
          this.$router.push({ name: 'OrganizationList' })
          break
        default:
          orgUtil.changeOrg(org, true, this)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/variables.scss';

$height: 28px;

.org-select {
  line-height: $height;
}

::v-deep .el-input {
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

    ::v-deep .el-select-group__title {
      color: var(--color-icon-primary);
      padding-left: 15px;
      font-size: 12px;
      line-height: 30px;
    }

    ::v-deep .el-select-dropdown__item {
      padding: 0 15px;
      line-height: 30px;
      height: 30px;
    }
  }
}

.org-select ::v-deep .el-input.is-disabled .el-input__inner {
  color: #ffffff !important;
  background-color: transparent;
}

.icon {
  cursor: pointer;
}

.line {
  width: 1px;
  margin-left: 5px;
  border: .5px solid #FFF;
  opacity: 0.4;
}
</style>
