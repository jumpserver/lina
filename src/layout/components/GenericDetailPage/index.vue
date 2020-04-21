<template>
  <Page>
    <span slot="title">
      {{ title }}
    </span>

    <template #headingRightSide>
      <span v-if="hasRightSide">
        <ActionsGroup slot="headingRightSide" :actions="pageActions" />
      </span>
    </template>

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
    },
    canDelete: {
      type: [Boolean, Function],
      default: true
    },
    deleteCallback: {
      type: Function,
      default: function(item) {
        return this.defaultDelete(item)
      }
    },
    deleteRoute: {
      type: String,
      default: null
    },
    canUpdate: {
      type: [Boolean, Function],
      default: true
    },
    updateCallback: {
      type: Function,
      default: function(item) {
        return this.defaultUpdate(item)
      }
    },
    updateRoute: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      activeName: this.activeMenu || null,
      pageActions: [
        {
          name: 'update',
          title: this.$tc('Update'),
          can: this.canUpdate,
          callback: this.updateCallback.bind(this)
        },
        {
          name: 'delete',
          title: this.$tc('Delete'),
          can: this.canDelete,
          callback: this.deleteCallback.bind(this)
        }
      ]
    }
  },
  methods: {
    defaultDelete() {

    },
    defaultUpdate() {
      const id = this.$route.params.id
      const defaultUpdateRoute = this.$route.name.replace('Detail', 'Update')
      const routeName = this.updateRoute || defaultUpdateRoute
      this.$router.push({ name: routeName, params: { id: id }})
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
