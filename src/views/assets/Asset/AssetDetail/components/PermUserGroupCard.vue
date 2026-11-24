<template>
  <div>
    <IBox v-bind="$attrs" :fa="icon" :title="title" :type="type">
      <table class="card-table">
        <div v-cloak v-if="iObjects.length > 0">
          <tr v-for="obj of iObjects" :key="obj.value" class="item">
            <td class="name-cell">
              <el-tooltip
                :content="obj.label"
                :show-after="500"
                effect="dark"
                placement="left"
                style="margin: 4px"
              >
                <el-link
                  v-if="$hasPerm('users.view_usergroup')"
                  class="detail"
                  @click="goDetail(obj)"
                >
                  {{ obj.label }}
                </el-link>
                <span v-else>{{ obj.label }}</span>
              </el-tooltip>
            </td>
            <td class="action-cell">
              <el-button size="small" type="primary" @click="buttonClickCallback(obj)">
                {{ buttonTitle }}
              </el-button>
            </td>
          </tr>
        </div>
        <div v-cloak v-else style="text-align: center">
          {{ $t('NoData') }}
        </div>
      </table>
    </IBox>
    <Drawer
      v-if="drawerVisible"
      v-model:visible="drawerVisible"
      :component="detailDrawer"
      :component-props="detailDrawerProps"
      :has-footer="false"
      :title="title"
    />
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox'
import Drawer from '@/components/Drawer/index.vue'

export default {
  name: 'PermUserGroupCard',
  components: {
    IBox,
    Drawer
  },
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'primary'
    },
    url: {
      type: String,
      required: true
    },
    detailRoute: {
      type: [String, Function],
      default: ''
    },
    buttonTitle: {
      type: String,
      required: true
    },
    buttonClickCallback: {
      type: Function,
      default: (obj) => {}
    }
  },
  emits: ['group-deleted'],
  data() {
    return {
      detailDrawer: '',
      detailDrawerProps: {},
      drawerVisible: false,
      objects: []
    }
  },
  computed: {
    iObjects() {
      return this.objects
    }
  },
  mounted() {
    this.loadObjects()
  },
  methods: {
    async loadObjects() {
      const data = await this.$axios.get(this.url)
      for (const v of data) {
        v['label'] = v['name']
      }
      this.objects = data
    },
    goDetail(obj) {
      const url = `/api/v1/users/groups/${obj.id}/`
      this.detailDrawer = this.detailRoute
      this.detailDrawerProps = {
        actions: {
          detailApiUrl: url,
          canUpdate: () =>
            !this.$store.getters.currentOrgIsRoot && this.$hasPerm('users.change_usergroup'),
          canDelete: () => this.$hasPerm('users.delete_usergroup'),
          updateCallback: () => {
            this.drawerVisible = false
            return this.$router.push({ name: 'UserGroupUpdate', params: { id: obj.id } })
          },
          deleteCallback: () => this.deleteGroup(obj, url)
        },
        drawerContext: {
          isDrawer: true,
          action: 'detail',
          row: {},
          col: {},
          id: obj.id,
          params: { id: obj.id },
          query: {},
          routeName: this.$route.name || ''
        }
      }
      this.drawerVisible = true
    },
    async deleteGroup(group, url) {
      try {
        await this.$confirm(`${this.$t('DeleteWarningMsg')} ${group.name} ?`, this.$t('Info'), {
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        })
        await this.$axios.delete(url)
      } catch (error) {
        if (error instanceof Error && !error.response) this.$message.error(error.message)
        return
      }
      if (this.detailDrawerProps.drawerContext.id === group.id) this.drawerVisible = false
      this.$message.success(this.$t('DeleteSuccessMsg'))
      this.$emit('group-deleted')
      return this.loadObjects()
    }
  }
}
</script>

<style lang="scss" scoped>
.card-table {
  width: 100%;
  table-layout: fixed;
}

[v-cloak] {
  display: none !important;
}

b,
strong {
  font-size: 13px;
}

tr.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  // 行内用 flex 居中对齐：按钮（small）比文字高，原先 float + inline 单元格无法把按钮
  // 纳入行高计算，按钮溢出贴到 border-bottom。flex 居中后按钮垂直居中，padding 在上下
  // 各留出与 border 的间距。
  padding: 6px 8px;
  border-bottom: 1px solid #e7eaec;

  &:last-child {
    border-bottom: 0;
  }

  .name-cell {
    flex: 1 1 auto;
    min-width: 0;
    line-height: 1.2;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-cell {
    flex: 0 0 auto;
    padding: 0;
  }
}

.box-margin {
  margin-bottom: 20px;
}
</style>
