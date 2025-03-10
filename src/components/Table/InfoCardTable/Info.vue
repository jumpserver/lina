<template>
  <div class="item-info">
    <el-row>
      <el-col v-for="item of infos" :key="item.content" :span="12" class="panel-item">
        <small class="item-label">{{ item.title }}:</small>
        <h4 class="item-value">{{ item.content }}</h4>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'InfoPanel',
  components: {},
  props: {
    infos: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {}
  },
  mounted() {
    console.log('INfo: ', this.infos)
  }
}
</script>

<style lang='scss' scoped>
@mixin textOverflow {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.panel-item {
  text-align: start;
}

.panel-label {

}

//
//.panel-item {
//  flex-wrap: nowrap;
//  text-align: left;
//  padding: 3px 0;
//  line-height: 20px;
//
//  .item-label {
//    text-align: left;
//    display: flex;
//    flex: 1;
//    min-width: 110px;
//  }
//
//  .text-info {
//    flex: 2;
//    @include textOverflow;
//  }
//}
//

</style>
