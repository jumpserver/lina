<template>
  <div v-if="filters || summary" :class="isExpand ? 'expand': 'shrink' " class="quick-filter">
    <div v-show="isExpand" class="quick-filter-wrap">
      <div v-show="filters" class="quick-filter-zone">
        <div v-for="category in filters" :key="category.label" class="item-zone">
          <h5>{{ category.label }}</h5>
          <div class="filter-options">
            <span v-for="option in category.options" :key="option.label" class="item">
              {{ option.label }}
            </span>
          </div>
        </div>
      </div>
      <div v-show="summary" class="summary-zone">
        <span v-for="item of summary" :key="item.title">
          <SummaryCard :body="item.body" :title="item.title" />
        </span>
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
import SummaryCard from '@/views/dashboard/components/SummaryCard.vue'

export default {
  name: 'QuickFilter',
  components: { SummaryCard },
  props: {
    filters: {
      type: Array,
      default: null
    },
    summary: {
      type: Array,
      default: null
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
  },
  methods: {
    toggle() {
      this.isExpand = !this.isExpand
    }
  }
}
</script>
<style lang='scss' scoped>
 .quick-filter {
   background: white;
   padding: 10px 10px 10px 20px;
   margin-bottom: 10px;
   display: flex;
   place-content: stretch flex-end;
   justify-content: center;
   align-content: stretch;
   box-shadow: 0 1px 1px 0 rgba(54, 58, 80, .32);

   &.shrink {
     background: inherit;
     padding: 0;
     margin-bottom: 0;
     box-shadow: none;
   }

   .quick-filter-wrap {
     display: inline-block;
     width: calc(100% - 70px);

     .summary-zone {
       padding-top: 10px;
       display: flex;
       justify-content: space-between;
     }

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
   }
 }

 .filter-options {
   display: block;
 }

 .expand-bar-wrap {
   margin: auto 0;
   min-width: 60px;

   .expand-bar {
     float: right;
     display: block;
     cursor: pointer;

     i {
       padding: 5px;

       &.shrink {
         transform: rotate(180deg);
       }
     }
   }
 }

</style>
