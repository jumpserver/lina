<template>
  <el-select
    :value="currentOrg.id"
    class="org-select organization"
    filterable
    :placeholder="$t('common.Select')"
    @change="changeOrg"
  >
    <template slot="prefix">
      <i class="fa fa-sitemap icon" />
    </template>

    <el-option-group
      v-for="group in orgOption"
      :key="group.label"
      :label="group.label"
      class="option-group"
    >
      <el-option
        v-for="item in group.options"
        :key="item.id"
        :selected="item.id === currentOrg.id"
        :label="item.name"
        :value="item.id"
        :disabled="item.disabled"
      >
        <span v-if="item.icon" style="float: right; font-size: 12px">
          <i class="fa" :class="item.icon" />
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
      'currentRole',
      'orgs'
    ])
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const orgActions = {
        label: this.$t('xpack.Organization.OrganizationList'),
        options: [
          {
            id: 'create',
            icon: 'fa-plus',
            disabled: !this.$hasPerm('orgs.add_organization'),
            name: this.$t('xpack.Organization.OrganizationCreate')
          },
          {
            id: 'list',
            icon: 'fa-list-ul',
            disabled: !this.$hasPerm('orgs.view_organization'),
            name: this.$t('xpack.Organization.OrganizationLists')
          }
        ]
      }
      const hasPerms = this.$hasPerm('orgs.view_organization | orgs.add_organization')
      this.orgOption = [
        (hasPerms && orgActions),
        {
          label: this.$t('xpack.Organization.AllOrganization'),
          options: this.orgs
        }
      ]
    },
    changeOrg(orgId) {
      if (orgId === 'create') {
        this.$router.push({ name: 'OrganizationCreate' })
      } else if (orgId === 'list') {
        this.$router.push({ name: 'OrganizationList' })
      } else {
        orgUtil.changeOrg(orgId)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/element-variables.scss';

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
  color: #606266;
  cursor: pointer;
}

.organization {
  height: 35px;
  line-height: 35px;
  background: #E0E0E0;
  border-radius: 19px;
  color: #606266;

  &:after {
    position: absolute;
    top: 15%;
    left: -16px;
    content: '';
    width: 1px;
    height: 25px;
    background-color: rgba(144, 147, 152, .5);
  }

  &>>> .el-input__prefix {
    left: 8px
  }

  &>>> .el-input--prefix .el-input__inner {
    line-height: 35px !important;
    height: 35px !important;
  }

  &>>> .fa-sitemap {
    padding-left: 4px;
  }

  &>>> .el-input__icon {
    color: #606266;
  }
}

.option-group >>> .el-select-group__title {
  color: #909399 !important;
  padding-left: 15px;
  font-size: 12px;
  line-height: 30px;
}
</style>
