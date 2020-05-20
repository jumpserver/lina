<template>
  <IBox v-bind="$attrs">
    <div class="ibox-heading">
      <slot name="content-heading">
        <h3><i class="fa fa-envelope-o" /> New messages</h3>
        <small><i class="fa fa-tim" /> You have 22 new messages and 16 waiting in draft folder.</small>
      </slot>
    </div>
    <slot />
  </IBox>
</template>

<script>
import IBox from './index'
export default {
  name: 'HeadingIBox',
  components: { IBox }
}
</script>

<style scoped>
  .ibox-heading {
    background-color: #f3f6fb;
    border-bottom: none;
    margin-left: -20px;
    margin-right: -20px;
    margin-top: -20px;
    margin-bottom: 20px;
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
