<template>
  <IBox
    :fa="icon"
    :type="type"
    :title="title"
    v-bind="$attrs"
  >
    <table class="card-table">
      <div v-if="iObjects.length > 0" v-cloak>
        <tr v-for="obj of iObjects" :key="obj.value" class="item">
          <td>
            <el-tooltip
              style="margin: 4px;"
              effect="dark"
              :content="obj.label"
              placement="left"
            >
              <el-link class="detail" @click="goDetail(obj)">
                {{ obj.label }}
              </el-link>
            </el-tooltip>
          </td>
          <td>
            <el-button
              size="mini"
              type="primary"
              style="float: right"
              @click="buttonClickCallback(obj)"
            >
              {{ buttonTitle }}
            </el-button>
          </td>
        </tr>
      </div>
      <div v-else v-cloak style="text-align: center;">
        {{ $t('common.NoData') }}
      </div>
    </table>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'

export default {
  name: 'PermUserGroupCard',
  components: {
    IBox
  },
  props: {
    icon: {
      type: String,
      required: true
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
      type: String,
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
      this.$router.push({ name: this.detailRoute, params: { id: obj.id }})
    }
  }
}
</script>

<style lang="scss" scoped>
  .card-table {
    width: 100%;
    table-layout:fixed;
  }
  [v-cloak]{
    display: none!important;
  }
  b, strong {
    font-weight: 700;
    font-size: 13px;
  }
  tr td {
    line-height: 1.42857;
    padding: 8px;
    vertical-align: top;
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  tr.item {
    border-bottom: 1px solid #e7eaec;
    padding: 8px;
    display: block;
    &:last-child {
       border-bottom: 0;
    }
  }
  .box-margin {
    margin-bottom: 20px;
  }
</style>
