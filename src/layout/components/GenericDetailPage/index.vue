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
import { getApiPath } from '@/utils/common'
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
    deleteUrl: {
      type: String,
      default: function() {
        return getApiPath(this)
      }
    },
    deleteSuccessRoute: {
      type: String,
      default: function() {
        return this.$route.name.replace('Detail', 'List')
      }
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
      default: function() {
        return this.$route.name.replace('Detail', 'Update')
      }
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
      const msg = this.$tc('Are you sure to delete') + ' ?'
      const title = this.$tc('Info')
      const performDelete = async function() {
        this.$log.debug('Start perform delete: ', this.deleteUrl)
        return this.$axios.delete(this.deleteUrl)
      }
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete.bind(this)()
            done()
            this.$message.success(this.$tc('Delete success'))
            this.$router.push({ name: this.deleteSuccessRoute })
          } catch (error) {
            this.$message.error(this.$tc('Delete failed' + ' ' + error))
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    defaultUpdate() {
      const id = this.$route.params.id
      this.$router.push({ name: this.updateRoute, params: { id: id }})
    },
    getObject() {
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
