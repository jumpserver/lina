<template>
  <IBox class="box">
    <div slot="header" class="clearfix ibox-title">
      <i class="fa fa-info-circle" /> {{ title }}
    </div>
    <div class="content">
      <el-row :gutter="10">
        <el-col v-for="item in detailCardItems" :key="'card-' + item.key">
          <el-row :gutter="10" class="item">
            <el-col :md="6" :sm="12">
              <div :style="{ 'text-align': 'align' }" class="item-label">
                <label>{{ item.key }}: </label>
              </div>
            </el-col>
            <el-col :md="18" :sm="12">
              <div class="item-text">
                <ItemValue v-bind="item" />
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-divider v-if="specialCardItems.length > 0" />
      <el-row :gutter="10">
        <el-col v-for="item in specialCardItems" :key="'card-' + item.key" :md="24" :sm="24">
          <el-row class="item">
            <el-col :md="6" :sm="24">
              <div :style="{ 'text-align': 'align' }" class="item-label">
                <label>{{ item.key }}: </label>
              </div>
            </el-col>
            <el-col :md="18" :sm="24">
              <div class="item-text">
                <ItemValue v-bind="item" />
              </div>
            </el-col>
          </el-row>
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
</style>
