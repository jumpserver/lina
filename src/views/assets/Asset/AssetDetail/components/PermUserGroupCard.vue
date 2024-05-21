<template>
  <IBox
    :fa="icon"
    :title="title"
    :type="type"
    v-bind="$attrs"
  >
    <table class="card-table">
      <div v-cloak v-if="iObjects.length > 0">
        <tr v-for="obj of iObjects" :key="obj.value" class="item">
          <td>
            <el-tooltip
              :content="obj.label"
              :open-delay="500"
              effect="dark"
              placement="left"
              style="margin: 4px;"
            >
              <el-link class="detail" @click="goDetail(obj)">
                {{ obj.label }}
              </el-link>
            </el-tooltip>
          </td>
          <td>
            <el-button
              size="mini"
              style="float: right"
              type="primary"
              @click="buttonClickCallback(obj)"
            >
              {{ buttonTitle }}
            </el-button>
          </td>
        </tr>
      </div>
      <div v-cloak v-else style="text-align: center;">
        {{ $t('NoData') }}
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
    font-size: 13px;
  }
  tr td {
    line-height: 1.2;
    padding: 4px 8px;
    vertical-align: top;
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  tr.item {
    border-bottom: 1px solid #e7eaec;
    padding: 4px  8px;
    display: block;
    //&:last-child {
    //   border-bottom: 0;
    //}
  }
  .box-margin {
    margin-bottom: 20px;
  }

</style>
