<template>
  <IBox class="box">
    <div slot="header" class="clearfix ibox-title">
      <i /> {{ title }}
    </div>
    <div class="content">
      <el-row :gutter="10">
        <el-col
          v-for="item in detailCardItems"
          :key="'card-' + item.key"
          :md="12"
          :sm="12"
          style="display: flex;"
        >
          <div :style="{ 'text-align': 'align' }" class="item-label">
            <label>{{ item.key }}: </label>
          </div>
          <div class="item-text">
            <ItemValue v-bind="item" />
          </div>
        </el-col>
      </el-row>
      <el-divider v-if="specialCardItems.length > 0" />
      <el-row :gutter="10">
        <el-col
          v-for="item in specialCardItems"
          :key="'card-' + item.key"
          :md="12"
          :sm="12"
          style="display: flex;"
        >
          <div :style="{ 'text-align': 'align' }" class="item-label">
            <label>{{ item.key }}: </label>
          </div>
          <div class="item-text">
            <ItemValue v-bind="item" />
          </div>
        </el-col>
      </el-row>
    </div>
  </IBox>
</template>
<script>
import ItemValue from '@/components/Cards/DetailCard/ItemValue'
import IBox from '@/components/IBox'

export default {
  name: 'Details',
  components: { ItemValue, IBox },
  props: {
    specialCardItems: {
      type: Array,
      default: () => ([])
    },
    detailCardItems: {
      type: Array,
      default: () => ([])
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang='less' scoped>
.box {
  margin-bottom: 15px;
}
.content {
  font-size: 13px;
  line-height: 2.5;
}
.item-label {
  margin-right: 4px;
  white-space: nowrap;
}
.item-label, .item-text {
  display: inline-block;
}
</style>
