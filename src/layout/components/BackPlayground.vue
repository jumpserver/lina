<template>
  <div class="backplayground">
    <div class="title">
      <div class="title-context">
        {{ title }}
      </div>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: () => { return 'Title' }
    }
  }

}
</script>

<style lang="less" scoped>
.backplayground{
    height: 100%;
    background-color: #ffffff;
    margin-left:8px;
    margin-right:8px;
    margin-top:1%;
    margin-bottom:1%;
}
.title{
  margin-top:1%;
  margin-bottom:calc(1% + 35px);
  background-color: #fff;
  .title-context{
    text-align: left;
    font-size: 14px;
    padding-top:15px;
    padding-left:12px;
    padding-bottom: 15px;
    font-weight: 600;
    border-bottom: 1px solid #e7eaec !important;
  }
}
</style>
