<template>
  <div v-if="!isCollapse && orglist.length>1" style="display: block; background-color: transparent; padding: 14px 20px 14px 20px">
    <el-dropdown size="medium">
      <span class="el-dropdown-link" style="color: rgb(167, 177, 194);">
        <i class="fa fa-bookmark" style="width: 14px;margin-right: 12px; " />
        {{ currentorg.name }}<i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="(option) in orglist" :key="option.id" @click.native="changeOrg(option.name,option.id)">{{ option.name }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
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
      'currentorg',
      'orglist'
    ])
  },
  methods: {
    changeOrg(x, y) {
      console.log(this.$store)
      this.$store.dispatch('user/setCurrentOrg', {
        name: x,
        id: y
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dropdown-menu{
  width: 200px;
}
.el-dropdown-menu >>> .popper__arrow{
  display: none;
}
.el-dropdown{
  width: 100%;
}
.el-icon-arrow-down{
    position: absolute;
    top: 50%;
    right: 0px;
    margin-top: -7px;
}
</style>
