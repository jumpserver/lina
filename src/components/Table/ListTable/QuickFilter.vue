<template>
  <div v-if="filters" class="quick-filter">
    <div v-show="isExpand" class="quick-filter-wrap">
      <div class="quick-filter-zone">
        <div v-for="category in filters" :key="category.label" class="item-zone">
          <h5>{{ category.label }}</h5>
          <div>
            <span v-for="option in category.options" :key="option.label" class="item">
              {{ option.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="expand-bar-wrap">
      <div class="expand-bar" @click="toggle">
        <i :class="isExpand ? 'expand': 'shrink' " class="fa fa-angle-double-up" />
        <span v-show="!isExpand"> 展开过滤器 </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickFilter',
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    expand: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isExpand: this.expand
    }
  },
  watch: {
    isExpand(val) {
      this.$emit('expand', val)
    }
  },
  mounted() {
    console.log(this.filters)
  },
  methods: {
    toggle() {
      this.isExpand = !this.isExpand
      console.log('toggle')
    }
  }
}
</script>
<style lang='scss' scoped>
 .quick-filter-zone {
   display: flex;
   justify-content: flex-start;

   h5 {
     font-weight: 600;
     text-transform: uppercase;
     font-size: 12px;
     margin-bottom: .5rem;
     line-height: 1.2;
     display: inline-block;
   }

   .item-zone {
     margin-right: 30px;
     margin-bottom: 5px;
   }

   .item {
     display: inline-block;
     margin-right: 10px;
     border-radius: 5px;
     background-color: #f5f7fa;
     color: #303133;
     font-size: 12px;
     cursor: pointer;

     &:hover {
       color: var(--color-primary);
     }
   }

   ul {
     list-style: none outside none;
     margin-block-start: 0;
     padding-left: 0;
   }
 }

 .quick-filter {
   display: flex;
   place-content: stretch flex-end;
   justify-content: center;
   align-content: stretch;
 }

 .quick-filter-wrap {
   display: inline-block;
   width: calc(100% - 25px);
   margin-bottom: 10px;
 }

 .expand-bar-wrap {
   margin: auto 0;
 }

 .expand-bar {
   text-align: center;
   display: inline-block;
   cursor: pointer;

   i {
     padding: 5px;

     &.shrink {
       transform: rotate(180deg);
     }
   }
 }

</style>
