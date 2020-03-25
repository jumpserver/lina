<template>
  <el-row :gutter="0" class="row wrapper border-bottom white-bg page-heading">
    <el-col :span="20" class="page-heading-left">
      <h2>Contacts 2</h2>
      <ol class="breadcrumb">
        <li>
          <a href="index.html">Home</a>
        </li>
        <li>
          App Views
        </li>
        <li class="active">
          <strong>Contacts 2</strong>
        </li>
      </ol>
    </el-col>
    <el-col :span="4" />
  </el-row>
</template>

<script>
export default {
  name: 'PageHeading',
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
    font-family: "open sans", "Helvetica Neue", Helvetica, Arial;
  }

  h2 {
    font-size: 24px;
    font-weight: 100;
  }

  .page-heading-left {
    min-height: 1px;
    padding-right: 15px;
    padding-left: 15px;
  }

  .breadcrumb {
    background-color: #ffffff;
    padding: 0;
    margin-bottom: 0;
    border-radius: 4px;
    list-style: none;
  }

  .breadcrumb>li+li:before {
    padding: 0 5px;
    color: #ccc;
    content: "/\00a0";
  }

  .breadcrumb>li {
    display: inline-block;
  }

  .breadcrumb > li a {
    color: inherit;
    cursor: pointer;
    text-decoration: none;
    background-color: transparent;
    list-style: none;
    font-size: 13px;
  }

  ol, ul {
    margin-top: 0;
  }
</style>
