<template>
  <div>
    <IBox v-bind="$attrs" :fa="icon" :title="title" :type="type">
      <table class="card-table">
        <div v-cloak v-if="iObjects.length > 0">
          <tr v-for="obj of iObjects" :key="obj.value" class="item">
            <td class="name-cell">
              <el-tooltip
                :content="obj.label"
                :open-delay="500"
                effect="dark"
                placement="left"
                style="margin: 4px"
              >
                <el-link class="detail" @click="goDetail(obj)">
                  {{ obj.label }}
                </el-link>
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
      v-model:visible="drawerVisible"
      :component="detailDrawer"
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
  data() {
    return {
      detailDrawer: '',
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
      this.detailDrawer = this.detailRoute
      this.$store
        .dispatch('common/setDrawerActionMeta', {
          action: 'create',
          row: {},
          id: obj.id
        })
        .then(() => {
          this.drawerVisible = true
        })
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
