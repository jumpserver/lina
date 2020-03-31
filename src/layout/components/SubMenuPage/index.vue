<template>
  <Page>
    <span slot="title">
      <slot name="title" />
    </span>
    <span slot="headingRightSide">
      <slot name="headingRightSide" />
    </span>

    <div slot="content">
      <el-tabs v-if="submenu.length > 0" slot="submenu" v-model="activeName" class="page-submenu">
        <el-tab-pane v-for="item in submenu" :key="item.name" :label="item.title" :name="item.name">
          <slot :name="item.name">
            <pre>
              使用 slot 为我填充
            </pre>
          </slot>
        </el-tab-pane>
      </el-tabs>
    </div>
  </Page>
</template>

<script>
import Page from '../Page/'
export default {
  name: 'SubMenuPage',
  components: {
    Page
  },
  props: {
    submenu: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      activeName: this.activeMenu || null
    }
  },
  mounted() {
    console.log(this.submenu)
  }
}
</script>

<style scoped>
  .page-submenu >>> .el-tabs__header {
    background-color: white;
    margin-left: -25px;
    padding-left: 25px;
    margin-right: -25px;
    padding-right: 25px;
    margin-top: -30px;
    /*margin: 0;*/
    /*background-color: #f3f3f4;*/
  }
</style>
