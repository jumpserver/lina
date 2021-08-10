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

</style>
