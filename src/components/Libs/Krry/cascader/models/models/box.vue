<template>
  <div class="el-transfer-panel district-panel">
    <div class="el-transfer-panel__header">
      <el-checkbox
        v-model="checkAll"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
      >{{ title }}</el-checkbox>
      <span
        class="check-number"
      >{{ selectedDistrict.length }}/{{ districtListMock.length }}</span>
    </div>
    <div class="el-transfer-panel__body">
      <div
        v-if="filterable"
        class="el-transfer-panel__filter el-input el-input--small el-input--prefix"
      >
        <input
          v-model="searchWord"
          type="text"
          autocomplete="off"
          :placeholder="filterPlaceholder"
          class="el-input__inner"
        >
        <span class="el-input__prefix" style="left: 0px">
          <i class="el-input__icon el-icon-search" />
        </span>
      </div>
      <el-checkbox-group
        v-if="districtListMock.length > 0"
        v-model="selectedDistrict"
        :class="{ expand: !filterable }"
        @change="handleCheckedChange"
      >
        <el-checkbox
          v-for="(city, index) in districtListMock"
          :key="index"
          class="el-transfer-panel__item"
          :disabled="city.disabled"
          :title="city.label"
          :label="city"
        >{{ city.label }}</el-checkbox>
      </el-checkbox-group>
      <p v-else class="no-data">无数据</p>
    </div>
    <div class="vip-footer">
      <el-button
        type="text"
        :disabled="selectedDistrict.length > 0 ? false : true"
        size="small"
        round
        @click="checkedSelected"
      >
        <span>{{ operation }}</span>
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    title: {
      type: String
    },
    operation: {
      type: String
    },
    operateId: {
      type: Number
    },
    // 区域数据
    districtList: {
      type: Array
    },
    filterable: {
      type: Boolean
    },
    filterPlaceholder: {
      type: String
    }
  },
  data() {
    return {
      districtListMock: [], // 展示的数据 （搜索会自动修改这个数组）
      selectedDistrict: [], // 已选择，数据格式：[区域id,id,id...]
      father: {}, // 父级数据
      isIndeterminate: false,
      checkAll: false,
      searchWord: '',
      buttonAble: true
    }
  },
  watch: {
    // 搜索框的监听器
    searchWord(newWord, oldWord) {
      // 重新获取数据
      this.districtListMock = this.districtList
      // 过滤掉数据，保留搜索的数据
      this.districtListMock = this.districtListMock.filter((val) =>
        val.label.includes(newWord)
      )
    },
    // 当点击省级或市级，自动监听并更新市级或区级的列表
    districtList() {
      this.getDistrict()
      // 如果区域数据为空，则已选择的数据也要清空
      if (this.districtList.length === 0) {
        this.selectedDistrict = []
      }
    },
    // districtListMock 和 checkAll 的监听器
    districtListMock() {
      // 当方框中无已选择的数据时，不能勾选checkBox
      if (this.selectedDistrict.length === 0) {
        this.checkAll = false
        this.isIndeterminate = false
      }
    },
    // 当列表中无数据时，不能勾选checkBox
    checkAll() {
      this.checkAll = this.districtListMock.length === 0 ? false : this.checkAll
    }
  },
  created() {
    this.getDistrict()
  },
  methods: {
    // 获取区域数据
    getDistrict() {
      this.districtListMock = this.districtList
      // 已选择的清空
      this.selectedDistrict = []
    },
    // 单选
    handleCheckedChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.districtListMock.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.districtListMock.length
      this.$emit('check-district', value)
    },
    // 全选
    handleCheckAllChange(val) {
      this.selectedDistrict = val ? this.districtListMock.filter(val => !val.disabled).map((val) => val) : []
      this.isIndeterminate = false
    },
    // 添加至已选 或 删除已选区域
    checkedSelected() {
      const selectedList = []
      const filterId = []
      if (this.operateId === 0) {
        // 省级添加
        for (const val of this.selectedDistrict) {
          selectedList.push({
            id: val.id,
            label: val.label
          })
          filterId.push(val.id)
        }
        this.$emit('selected-checked', selectedList, filterId)
      } else if (this.operateId === 1 || this.operateId === 2) {
        // 市级或县级添加
        for (const val of this.selectedDistrict) {
          selectedList.push({
            id: this.father.id + '-' + val.id,
            label: this.father.label + '-' + val.label
          })
          filterId.push(val.id)
        }
        this.$emit('selected-checked', selectedList, filterId)
      } else {
        // 删除已选区域
        for (const val of this.selectedDistrict) {
          selectedList.push({
            id: val.id,
            label: val.label
          })
        }
        this.$emit('delete-checked', selectedList)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.district-panel {
  width: 200px;

  .el-transfer-panel__header {
    .el-checkbox {
      display: inline-block;
    }
  }
  .el-transfer-panel__body {
    height: 292px;
    padding: 6px 0;

    .el-transfer-panel__filter {
      line-height: 0;
      margin: 6px 14px 12px;
    }
  }
  .el-checkbox-group {
    height: 240px;
    overflow: auto;
    &.expand {
      height: 290px;
    }

    .el-transfer-panel__item {
      display: block;
    }
  }
  .check-number {
    position: absolute;
    right: 15px;
    top: 0;
    color: #909399;
    font-size: 12px;
    font-weight: 400;
  }
  .no-data {
    font-size: 14px;
    margin: 0;
    height: 30px;
    line-height: 30px;
    padding: 6px 15px 0;
    color: #909399;
    text-align: center;
  }
  .vip-footer {
    position: relative;
    margin: 0;
    padding: 5px 0;
    text-align: center;
    border-top: 1px solid #ebeef5;
  }
}
</style>
