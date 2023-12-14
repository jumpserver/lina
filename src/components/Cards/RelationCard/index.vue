<template>
  <IBox :title="title" :type="type" v-bind="$attrs">
    <table class="CardTable" style="width: 100%;table-layout:fixed;">
      <tr>
        <td colspan="2">
          <Select2 ref="select2" v-model="select2.value" :disabled="iDisabled" v-bind="select2" />
        </td>
      </tr>
      <slot />
      <tr>
        <td colspan="2">
          <el-button :disabled="iDisabled" :loading="submitLoading" :type="type" size="small" @click="addObjects">
            {{ $t('common.Add') }}
          </el-button>
        </td>
      </tr>
      <template v-if="showHasObjects">
        <tr v-for="obj of iHasObjects" :key="obj.value" class="item">
          <td style="width: 100%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            <el-tooltip :content="obj.label" effect="dark" placement="left" style="margin: 4px;">
              <b>{{ obj.label }}</b>
            </el-tooltip>
          </td>
          <td>
            <el-button :disabled="iDisabled" size="mini" style="float: right" type="danger" @click="removeObject(obj)">
              <i class="fa fa-minus" />
            </el-button>
          </td>
        </tr>
      </template>
      <tr v-if="params.hasMore && showHasMore" class="item">
        <td colspan="2">
          <el-button :disabled="iDisabled" :type="type" size="small" style="width: 100%" @click="loadMore">
            <i class="fa fa-arrow-down" />
            {{ $t('common.More') }}
          </el-button>
        </td>
      </tr>
    </table>
  </IBox>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2.vue'
import IBox from '../../IBox/index.vue'
import { createSourceIdCache } from '@/api/common'
import { mapGetters } from 'vuex'

export default {
  name: 'RelationCard',
  components: {
    Select2,
    IBox
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
    type: {
      type: String,
      default: 'primary'
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
    showHasObjects: {
      type: Boolean,
      default: true
    },
    value: {
      type: [Array, Number, String],
      default: () => []
    },
    disabled: {
      type: [Boolean, Function],
      default: null
    },
    showHasMore: {
      type: Boolean,
      default: true
    },
    performDelete: {
      type: Function,
      default: (obj, that) => {}
    },
    allowCreate: {
      type: Boolean,
      default: false
    },
    onDeleteSuccess: {
      type: Function,
      default(obj, that) {
        // 从hasObjects中移除这个object
        const theRemoveIndex = that.iHasObjects.findIndex((v) => v.value === obj.value)
        that.iHasObjects.splice(theRemoveIndex, 1)
        // 从disabled values中移除这个value
        while (that.select2.disabledValues.indexOf(obj.value) !== -1) {
          const i = that.select2.disabledValues.indexOf(obj.value)
          this.$log.debug('disabled values remove index: ', i)
          that.select2.disabledValues.splice(i, 1)
        }
        that.$message.success(that.$t('common.RemoveSuccessMsg'))
      }
    },
    onDeleteFail: {
      type: Function,
      default(error, that) {
        let msg = ''
        const data = error.response.data
        for (const item of Object.keys(data)) {
          const value = data[item]
          if (value instanceof Array) {
            msg = value.join(',')
          } else {
            msg = value
          }
        }
        that.$message.error(msg)
      }
    },
    performAdd: {
      type: Function,
      default: (objects, that) => {}
    },
    onAddSuccess: {
      type: Function,
      default(objects, that) {
        that.$log.debug('Select value', that.select2.value)
        that.iHasObjects = [...that.iHasObjects, ...objects]
        that.$refs.select2.clearSelected()
        that.$message.success(that.$t('common.AddSuccessMsg'))
      }
    },
    getHasObjects: {
      type: Function,
      default: null // (objectIds) => {}
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
        disabled: this.disabled,
        disabledValues: [],
        allowCreate: this.allowCreate
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    iAjax() {
      return this.$refs.select2.iAjax
    },
    safeMakeParams() {
      return this.$refs.select2.safeMakeParams
    },
    hasObjectLeftLength() {
      return this.totalHasObjectsLength - this.iHasObjects.length
    },
    iDisabled() {
      if (this.disabled !== null) {
        return this.disabled
      }
      return this.currentOrgIsRoot
    }
  },
  watch: {
    hasObjectsId(iNew, iOld) {
      this.$log.debug('hasObject id change')
      this.select2.disabledValues = iNew
    },
    iHasObjects(iNew, iOld) {
      const newValues = iNew.map(v => v.value)
      const oldValues = iOld.map(v => v.value)
      const addValues = _.difference(newValues, oldValues)
      const removeValues = _.difference(oldValues, newValues)
      this.$log.debug('hasObjects change, add ', addValues, 'remove ', removeValues)
      let disabledValues = this.select2.disabledValues
      if (removeValues.length > 0) {
        disabledValues = disabledValues.filter((v) => {
          return removeValues.indexOf(v) === -1
        })
      }
      if (addValues.length > 0) {
        disabledValues = [...disabledValues, ...addValues]
      }
      this.select2.disabledValues = disabledValues
    }
  },
  mounted() {
    if (this.hasObjectsId && this.hasObjectsId.length !== 0) {
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
      let data = await this.$axios.get(this.iAjax.url, {
        params: params,
        validateStatus: (status) => {
          if (status === 403) {
            return 200
          }
          return status
        }
      })
      data = this.iAjax.processResults.bind(this)(data)
      data.results && data.results.forEach((v) => {
        if (!this.hasObjects.find((item) => item.value === v.value)) {
          this.iHasObjects.push(v)
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
      if (this.getHasObjects) {
        this.getHasObjects(this.hasObjectsId).then((data) => {
          this.iHasObjects = data
        })
      } else {
        const resp = await createSourceIdCache(this.hasObjectsId)
        this.params.spm = resp.spm
        await this.loadHasObjects()
      }
    },
    removeObject(obj) {
      this.performDelete(obj, this).then(
        () => this.onDeleteSuccess(obj, this)
      ).catch(error => {
        this.onDeleteFail(error, this)
      })
    },
    addObjects() {
      const objects = this.$refs.select2.$refs.select.selected.map(item => ({ label: item.label, value: item.value }))
      if (objects.length === 0) {
        return
      }
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
