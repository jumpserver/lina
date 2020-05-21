<template>
  <transition name="sidebarLogoFade">
    <el-select
      v-if="!isCollapse && userAdminOrgList.length>1 && checkPermission "
      :value="currentOrg.id"
      class="org-select"
      filterable
      placeholder="请选择"
      @change="changeOrg"
    >
      <template slot="prefix">
        <i class="fa fa-bookmark" />
      </template>

      <el-option
        v-for="item in userAdminOrgList"
        :key="item.id"
        selected="item.id == currentOrg.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPermission } from '@/utils/auth'
export default {
  props: {
    isCollapse: {
      type: Boolean,
      default: () => {
        return true
      }
    }
  },
  computed: {
    checkPermission() {
      return getPermission() === 'Admin'
    },
    ...mapGetters([
      'currentOrg',
      'userAdminOrgList'
    ]),
    orgIdMapper() {
      const mapper = {}
      this.userAdminOrgList.forEach((v) => {
        mapper[v.id] = v
      })
      return mapper
    }
  },
  mounted() {
    this.$log.debug('Admin orgs: ', this.userAdminOrgList)
  },
  methods: {
    changeOrg(orgId) {
      const org = this.orgIdMapper[orgId]
      if (!org) {
        this.$log.debug('Error: org not found')
      }
      this.$store.dispatch('users/setCurrentOrg', org)
    }
  }
}
</script>

<style lang="scss" scoped>
  .org-select {
    padding: 0 10px 7px 18px;
    transition: opacity 0s;
  }

  .org-select >>> input.el-input__inner {
    background: none;
    border: none;
    color: #8095a8;
    font-size: 13px;
  }

  .org-select >>> input.el-input__inner::placeholder {
    opacity: 0.2;
  }

  .org-select >>> .el-input__prefix {
    line-height: 34px;
    /*margin: auto 5px;*/
  }

  .sidebarLogoFade-enter,
  .sidebarLogoFade-leave-to {
    opacity: 0;
  }
</style>
