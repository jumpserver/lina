<template>
  <el-card class="box-card primary">
    <div slot="header" class="clearfix">
      <i v-if="icon" :class="'fa ' + icon" />
      <span>{{ title }}</span>
    </div>
    <div>
      <table style="width: 100%">
        <tr>
          <td colspan="2">
            <Select2 v-model="select2.value" v-bind="select2" @loadInitialOptionsDone="handleLoadInitialDone" />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <el-button type="primary" size="small">{{ $tc('Add') }}</el-button>
          </td>
        </tr>
        <tr v-for="obj of validObjects" :key="obj.id" style="width: 100%" class="item">
          <td><b>{{ obj.value }}</b></td>
          <td>
            <el-button size="mini" type="danger" style="float: right">
              <i class="fa fa-minus" />
            </el-button>
          </td>
        </tr>
      </table>
    </div>
  </el-card>
</template>

<script>
import Select2 from '@/components/Select2'

export default {
  name: 'RelationCard',
  components: {
    Select2
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    // 地址，发送给select2的，查询所有可以关联的对象
    url: {
      type: String,
      default: ''
    },
    // 已选择的objects Id, 会转换成select2的value, 作为默认选择项
    objectsId: {
      type: Array,
      default: () => []
    },
    objects: {
      type: Array,
      default: null
    },
    value: {
      type: [Array, Number, String],
      default: ''
    }
  },
  data() {
    return {
      validObjects: this.objects ? this.objects : [],
      select2: {
        url: this.url,
        value: this.value,
        isSelectedValue: false
      }
    }
  },
  methods: {
    handleLoadInitialDone(initialOptions) {
      if (this.objects === null) {
        this.validObjects = initialOptions
      }
    }
  }
}
</script>

<style scoped>
  b, strong {
    font-weight: 700;
    font-size: 13px;
  }

  tr td {
    line-height: 1.42857;
    padding: 8px;
    vertical-align: top;
  }

  tr.item td {
    border-top: 1px solid #e7eaec;
  }
</style>
