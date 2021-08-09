<template>
  <el-select
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
      v-for="item in orgs"
      :key="item.id"
      :selected="item.id === currentOrg.id"
      :label="item.name"
      :value="item.id"
    />
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
  computed: {
    ...mapGetters([
      'currentOrg',
      'currentRole',
      'orgs'
    ])
  },
  mounted() {
    console.log('Orgs: ', this.orgs)
  },
  methods: {

    changeOrg(orgId) {
      orgUtil.changeOrg(orgId)
    }
  }
}
</script>

<style lang="scss" scoped>
  //.org-select {
  //  padding: 0 10px 7px 18px;
  //  transition: opacity 0s;
  //}
  //
  .org-select >>> input.el-input__inner {
    background: none;
    border: none;
    font-size: 13px;
    margin: auto 5px;
  }
  .org-select >>> .el-input__prefix {
    line-height: 34px;
    //margin: auto 5px;
  }

  .org-select >>> .el-input__suffix {
    //margin: auto 5px;
    line-height: 34px;
  }
  //
  //.sidebarLogoFade-enter,
  //.sidebarLogoFade-leave-to {
  //  opacity: 0;
  //}
</style>
