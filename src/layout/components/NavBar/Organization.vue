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
        :selected="item.id === currentOrg.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import rolec from '@/utils/role'
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
  computed: {
    ...mapGetters([
      'currentOrg',
      'currentRole',
      'userAdminOrgList'
    ]),
    inAdminPage() {
      return (this.currentRole & rolec.PERM_USE) !== rolec.PERM_USE
    }
  },
  methods: {
    needShow() {
      const hasValidLicense = this.$store.getters.hasValidLicense
      return !this.isCollapse && this.inAdminPage && hasValidLicense
    },
    changeOrg(orgId) {
      orgUtil.changeOrg(orgId)
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
