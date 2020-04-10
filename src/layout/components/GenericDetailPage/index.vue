<template>
  <Page>
    <span slot="title">
      {{ title }}
    </span>
    <span v-if="hasRightSide" slot="headingRightSide">
      <ActionsGroup slot="headingRightSide" :actions="pageActions" />
    </span>

    <div>
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
import ActionsGroup from '@/components/ActionsGroup'
export default {
  name: 'GenericDetailPage',
  components: {
    Page,
    ActionsGroup
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    submenu: {
      type: Array,
      default: () => []
    },
    activeMenu: {
      type: String,
      default: () => ''
    },
    hasRightSide: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      activeName: this.activeMenu || null,
      pageActions: [
        {
          name: 'Update',
          title: this.$tc('Update')
        },
        {
          name: 'delete',
          title: this.$tc('Delete')
        }
      ]
    }
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
