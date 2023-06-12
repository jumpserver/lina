<template>
  <el-select
    :disabled="disabled"
    :placeholder="$tc('common.Select')"
    :value="currentOrgId"
    class="org-select organization"
    filterable
    popper-class="switch-org"
    @change="changeOrg"
  >
    <template slot="prefix">
      <svg-icon icon-class="organization" />
      <span class="line" />
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
        label: this.$t('xpack.Organization.OrganizationList'),
        options: [
          {
            id: 'create',
            icon: 'create',
            disabled: !this.$hasPerm('orgs.add_organization'),
            name: this.$t('xpack.Organization.OrganizationCreate')
          },
          {
            id: 'list',
            icon: 'list',
            disabled: !this.$hasPerm('orgs.view_organization'),
            name: this.$t('xpack.Organization.OrganizationLists')
          }
        ]
      }
      const hasPerms = this.$hasPerm('orgs.view_organization | orgs.add_organization')
      const isConsole = this.currentViewRoute.name === 'console'
      return hasPerms && isConsole ? orgActions : {}
    },
    orgChoicesGroup() {
      return {
        label: this.$t('xpack.Organization.AllOrganization'),
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

.org-select {
  padding: 0 10px 0 18px;
  line-height: 55px;
  background-color: #293846;
  color: white;
  font-weight: 600;
  font-size: 15px;
  //border-top: solid 1px rgb(47, 64, 80);
  ::v-deep .el-input {
    input.el-input__inner {
      line-height: 55px;
      height: 55px;
      background: none;
      border: none;
    }
  }
}

.icon {
  cursor: pointer;
}

.line {
  width: 1px;
  margin-left: 8px;
  border: .5px solid #FFF;
}

.organization {
  height: 32px;
  line-height: 32px;
  background: transparent;
  color: #FFF;

  & >>> .el-input__prefix {
    left: 0;
  }

  & >>> .el-input--prefix .el-input__inner {
    line-height: 32px !important;
    height: 32px !important;
  }

  & >>> .el-input__icon {
    color: #606266;
  }

  & >>> .el-input .el-select__caret {
    color: #FFF;
  }
}

.option-group {
  max-width: 400px;

  & >>> .el-select-group__title {
    color: #909399 !important;
    padding-left: 15px;
    font-size: 12px;
    line-height: 30px;
  }
}

.org-select >>> .el-input.is-disabled .el-input__inner {
  color: #ffffff !important;
}
</style>
