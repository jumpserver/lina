<template>
  <HeadingIBox v-bind="$attrs">
    <div class="ibox-content inspinia-timeline">
      <div v-for="(item, index) in items" :key="item.title + index" class="timeline-item">
        <el-row :gutter="20">
          <el-col :sm="6" class="date">
            <i v-if="item.fa" :class="'fa ' + item.fa" />
            <span v-if="item.date">{{ item.date }}</span>
            <br>
            <small v-if="item.timeSince" class="text-navy">{{ item.timeSince }}</small>
          </el-col>
          <el-col :sm="14" :class="'content ' + (index === 0 ? 'no-top-border' : '')">
            <p v-if="item.title" class="m-b-xs"><strong>{{ item.title }}</strong></p>
            <p v-if="item.content">{{ item.content }}</p>
          </el-col>
        </el-row>
      </div>
    </div>
  </HeadingIBox>
</template>

<script>
import HeadingIBox from '../IBox/HeadingIBox'
export default {
  name: 'TimelineCard',
  components: { HeadingIBox },
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
  .timeline-item .date {
    text-align: right;
    width: 110px;
    position: relative;
    padding-top: 30px;
  }

  .no-top-border {
    border-top: 0 !important;
  }

  .timeline-item .content {
    border-left: 1px solid #e7eaec;
    border-top: 1px solid #e7eaec;
    padding-top: 10px;
    min-height: 100px;
  }

  .timeline-item .content:hover {
    background: #f6f6f6;
  }

  .timeline-item .date i {
    position: absolute;
    top: 0;
    right: 0;
    padding: 5px;
    width: 30px;
    text-align: center;
    border-top: 1px solid #e7eaec;
    border-bottom: 1px solid #e7eaec;
    border-left: 1px solid #e7eaec;
    background: #f8f8f8;
  }

  .timeline-item .content {
    border-left: 1px solid #e7eaec;
    border-top: 1px solid #e7eaec;
    padding-top: 10px;
    min-height: 100px;
  }
</style>
