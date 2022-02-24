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
    >
      <el-option
        v-for="item in group.options"
        :key="item.id"
        :selected="item.id === currentOrg.id"
        :label="item.name"
        :value="item.id"
      />
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
    this.orgOption = [
      {
        label: this.$t('xpack.Organization.OrganizationList'),
        options: [{
          id: 'create',
          name: this.$t('xpack.Organization.OrganizationCreate')
        }]
      },
      {
        label: this.$t('xpack.Organization.AllOrganization'),
        options: this.orgs
      }
    ]
  },
  methods: {
    changeOrg(orgId) {
      if (orgId === 'create') {
        this.$router.push('/settings/orgs')
      } else {
        orgUtil.changeOrg(orgId)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/element-variables.scss";
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
    //margin-right: -15px;
    &:after {
      position: absolute;
      top: 15%;
      left: -16px;
      content: '';
      width: 1px;
      height: 25px;
      background-color: rgba(144,147,152,.5);
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
</style>
