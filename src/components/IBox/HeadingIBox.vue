<template>
  <IBox v-bind="$attrs">
    <div v-if="contentHeading" class="ibox-heading">
      <slot name="content-heading">
        <h3 v-if="contentHeading.title"><i v-if="contentHeading.fa" :class="'fa ' + contentHeading.fa" /> {{ contentHeading.title }}</h3>
        <small v-if="contentHeading.content"><i class="fa fa-tim" /> {{ contentHeading.content }}</small>
      </slot>
    </div>
    <slot />
  </IBox>
</template>

<script>
import IBox from './index'
export default {
  name: 'HeadingIBox',
  components: { IBox },
  props: {
    contentHeading: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>
  .ibox-heading {
    background-color: #f3f6fb;
    border-bottom: none;
    margin: -15px -20px 20px -20px;
    padding: 20px
  }
  .ibox-heading h3 {
    font-weight: 200;
    font-size: 24px;
    margin-top: 5px;
    margin-bottom: 10px;
    line-height: 1.1;
  }
  .ibox .el-card__body {
   background-color: #f3f6fb;
  }
</style>
