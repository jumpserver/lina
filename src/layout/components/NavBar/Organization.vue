<template>
  <transition name="sidebarLogoFade">
    <el-select
      v-if="needShow()"
      :value="currentOrg.id"
      class="org-select"
      filterable
      :placeholder="$t('common.Select')"
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
import { hasUUID } from '@/utils/common'
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
    ...mapGetters([
      'currentOrg',
      'currentRole',
      'userAdminOrgList'
    ]),
    hasOrgPermission() {
      return this.currentRole === 'Admin'
    },
    orgIdMapper() {
      const mapper = {}
      this.userAdminOrgList.forEach((v) => {
        mapper[v.id] = v
      })
      return mapper
    }
  },
  mounted() {
    if (this.hasOrgPermission) {
      this.checkCurrentOrgIsNeedChange()
    }
  },
  methods: {
    needShow() {
      return !this.isCollapse && this.userAdminOrgList.length > 1 && this.hasOrgPermission
    },
    checkCurrentOrgIsNeedChange() {
      if (!this.currentOrg || typeof this.currentOrg !== 'object') {
        this.$log.debug('Not has current org')
        this.change2PropOrg()
        return
      }
      if (!this.hasCurrentOrgPermission()) {
        this.$log.debug('Not has current org permission')
        this.change2PropOrg()
      }
    },
    getPropOrg() {
      let defaultOrg = this.userAdminOrgList.find((item) => item.id === '')
      if (defaultOrg) {
        return defaultOrg
      }
      defaultOrg = this.userAdminOrgList.find((item) => item.id === 'DEFAULT')
      if (defaultOrg) {
        return defaultOrg
      }
      return this.userAdminOrgList[0]
    },
    change2PropOrg() {
      const org = this.getPropOrg()
      setTimeout(() => this.changeOrg(org.id), 100)
    },
    hasCurrentOrgPermission() {
      const currentOrgId = this.currentOrg.id
      const orgInList = this.userAdminOrgList.find((item) => item.id === currentOrgId)
      return orgInList
    },
    changeOrg(orgId) {
      const org = this.orgIdMapper[orgId]
      if (!org) {
        this.$log.debug('Error: org not found')
      } else {
        this.$log.debug('Change to org: ', org)
      }
      this.$store.dispatch('users/setCurrentOrg', org).then(() => {
        this.$log.debug('Set current org to: ', org)
        if (hasUUID(location.href)) {
          location.href = process.env.VUE_APP_PUBLIC_PATH
        } else {
          window.location.reload(true)
        }
      })
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
