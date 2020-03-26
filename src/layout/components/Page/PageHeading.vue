<template>
  <el-row :gutter="0" class="row wrapper border-bottom white-bg page-heading">
    <el-col :span="20" class="page-heading-left">
      <div class="page-heading-left-title">
        <slot><h2>{{ title }}</h2></slot>
      </div>
      <Breadcrumb />
    </el-col>
    <el-col :span="4" />
  </el-row>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
export default {
  name: 'PageHeading',
  components: {
    Breadcrumb
  },
  props: {
    title: {
      type: String,
      default: () => ''
    }
  }
}
</script>

<style scoped>
  .page-heading {
    border-top: 0;
    padding: 0 10px 20px 10px;
    background-color: #ffffff;
  }

  .page-heading-left-title, h2 {
    font-size: 24px;
    font-weight: 100;
    line-height: 26px;
    margin-top: 20px;
    margin-bottom: 12px;
    max-height: 32px;
  }

  .page-heading-left {
    min-height: 1px;
    padding-right: 15px;
    padding-left: 15px;
  }
</style>
