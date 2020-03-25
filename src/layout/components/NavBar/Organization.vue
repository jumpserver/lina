<template>
  <transition name="sidebarLogoFade">
    <el-select
      class="org-didi"
      v-if="!isCollapse && userAdminOrgList.length>1"
      :value="currentOrg.id"
      filterable
      placeholder="请选择"
      @change="changeOrg">

      <template slot="prefix">
        <i class="fa fa-bookmark"></i>
      </template>

      <el-option
        v-for="item in userAdminOrgList"
        :key="item.id"
        selected="item.id == currentOrg.id"
        :label="item.name"
        :value="item.id">
      </el-option>
    </el-select>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    isCollapse: {
      type: Boolean,
      default: () => { return true }
    }
  },
  computed: {
    ...mapGetters([
      'currentOrg',
      'userAdminOrgList'
    ])
  },
  methods: {
    changeOrg(orgId) {
      console.log('Change to org: ', orgId)
      this.$store.dispatch('user/setCurrentOrg', {
        id: orgId
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .org-didi {
    padding: 0 10px 0 18px;
    transition: opacity 0s;
  }

  .org-didi >>> input.el-input__inner {
    background: none;
    border: none;
    color: #8095a8;
  }

  .org-didi >>> input.el-input__inner::placeholder {
    opacity: 0.2;
  }

  .org-didi >>> .el-input__prefix {
    line-height: 40px;
    /*margin: auto 5px;*/
  }

  .sidebarLogoFade-enter,
  .sidebarLogoFade-leave-to {
    opacity: 0;
  }
</style>
