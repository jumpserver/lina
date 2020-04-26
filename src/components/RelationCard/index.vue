<template>
  <el-card class="box-card primary box-margin">
    <div slot="header" class="clearfix">
      <i v-if="icon" :class="'fa ' + icon" />
      <span>{{ title }}</span>
    </div>
    <div>
      <table style="width: 100%">
        <tr>
          <td colspan="2">
            <Select2 ref="select2" v-model="select2.value" v-bind="select2" />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <el-button type="primary" size="small" :loading="submitLoading" @click="addObjects">{{ $tc('Add') }}</el-button>
          </td>
        </tr>
        <tr v-for="obj of iHasObjects" :key="obj.value" style="width: 100%" class="item">
          <td><b>{{ obj.label }}</b></td>
          <td>
            <el-button size="mini" type="danger" style="float: right" @click="removeObject(obj)">
              <i class="fa fa-minus" />
            </el-button>
          </td>
        </tr>
        <tr v-if="params.hasMore" class="item">
          <td colspan="2">
            <el-button type="primary" size="small" style="width: 100%" @click="loadMore">
              <i class="fa fa-arrow-down" />
              {{ $tc('More') }} ({{ iHasObjects.length }}/{{ totalHasObjectsLength }})
            </el-button>
          </td>
        </tr>
      </table>
    </div>
  </el-card>
</template>

<script>
import Select2 from '@/components/Select2'
import { createSourceIdCache } from '@/api/common'

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
    // 地址，发送给select2的，查询所有的objects, 和select2 ajax一样
    objectsAjax: {
      type: Object,
      default: () => ({})
    },
    objects: {
      type: [Array, null],
      default: null
    },
    // 已选择的objects Id, 会转换成select2的value, 作为默认选择项, 和objectsAjax类似
    hasObjectsId: {
      type: Array,
      default: () => []
    },
    hasObjects: {
      type: Array,
      default: () => []
    },
    value: {
      type: [Array, Number, String],
      default: () => []
    },
    performDelete: {
      type: Function,
      default: (obj, that) => {}
    },
    onDeleteSuccess: {
      type: Function,
      default(obj, that) {
        const theRemoveIndex = that.iHasObjects.findIndex((v) => v.value === obj.value)
        that.iHasObjects.splice(theRemoveIndex, 1)
      }
    },
    performAdd: {
      type: Function,
      default: (objects, that) => {}
    },
    onAddSuccess: {
      type: Function,
      default(objects, that) {
        for (const obj of objects) {
          that.iHasObjects.push(obj)
        }
      }
    }
  },
  data() {
    return {
      iHasObjects: this.hasObjects || [],
      totalHasObjectsLength: 0,
      submitLoading: false,
      params: {
        page: 1,
        hasMore: false,
        pageSize: 10
      },
      select2: {
        ajax: this.objectsAjax,
        options: this.objects,
        value: this.value,
        disabledValues: []
      }
    }
  },
  computed: {
    iAjax() {
      return this.$refs.select2.iAjax
    },
    safeMakeParams() {
      return this.$refs.select2.safeMakeParams
    },
    hasObjectLeftLength() {
      return this.totalHasObjectsLength - this.iHasObjects.length
    }
  },
  watch: {
    hasObjectsId(iNew, iOld) {
      this.$log.debug('hasObject id change')
      this.select2.disabledValues = iNew
      if (iNew.length !== 0) {
        setTimeout(() => {
          this.getHasObjectsByIds()
        }, 50)
      }
    }
  },
  mounted() {
    if (this.hasObjectsId.length !== 0) {
      setTimeout(() => {
        this.getHasObjectsByIds()
      }, 50)
    }
  },
  methods: {
    async loadMore() {
      if (this.loading) {
        return
      }
      if (!this.params.hasMore) {
        return
      }
      this.params.page = this.params.page ? this.params.page + 1 : 1
      try {
        this.loading = true
        await this.loadHasObjects()
      } finally {
        this.loading = false
      }
    },
    async loadHasObjects() {
      this.$log.debug('Start loadHasObject: ', this.params)
      const params = this.safeMakeParams(this.params)
      let data = await this.$axios.get(this.iAjax.url, { params: params })
      data = this.iAjax.processResults.bind(this)(data)
      data.results.forEach((v) => {
        if (!this.hasObjects.find((item) => item.value === v.value)) {
          this.hasObjects.push(v)
        }
      })
      // 如果还有其它页，继续获取, 如果没有就停止
      this.params.hasMore = !!data.pagination
      this.totalHasObjectsLength = data.total
    },
    async getHasObjectsByIds() {
      if (!this.$refs.select2 || !this.iAjax || !this.safeMakeParams) {
        return
      }
      this.select2.disabledValues = this.hasObjectsId
      const resp = await createSourceIdCache(this.hasObjectsId)
      this.params.spm = resp.spm
      await this.loadHasObjects()
    },
    removeObject(obj) {
      this.performDelete(obj, this).then(
        () => this.onDeleteSuccess(obj, this)
      )
    },
    addObjects() {
      const objects = this.$refs.select2.getOptionsByValues(this.select2.value)
      this.$log.debug('Object is: ', objects)
      this.performAdd(objects, this).then(
        () => this.onAddSuccess(objects, this)
      )
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
  .box-margin {
    margin-bottom: 20px;
  }
</style>
