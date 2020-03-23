<template>
  <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
    <el-tab-pane :label="$t('usergroup.user_group_detail')" name="first">
      <div class="ibox-title"><el-tag type="info">{{ group.name }}</el-tag></div>
      <div class="ibox-content">
        <table class="table">
          <tbody>
            <tr class="no-borders-tr">
              <td style="width: 20%">{{ $t('usergroup.name') }}:</td>
              <td><b>{{ group.name }}</b></td>
            </tr>
            <tr>
              <td style="width: 20%">{{ $t('usergroup.created_by') }}:</td>
              <td><b>{{ group.created_by }}</b></td>
            </tr>
            <tr>
              <td style="width: 20%">{{ $t('usergroup.date_created') }}:</td>
              <td><b>{{ group.date_created }}</b></td>
            </tr>
            <tr>
              <td style="width: 20%">{{ $t('usergroup.comment') }}:</td>
              <td><b>{{ group.comment }}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-tab-pane>
    <el-tab-pane :label="$t('usergroup.asset_granted')" name="second">{{ $t('usergroup.asset_granted') }}</el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  props: {
    group: {
      type: Object,
      default: () => { return {} }
    }
  },
  data() {
    return {
      activeName: 'first'
    }
  }
}
</script>

<style lang="less" scoped>

  .ibox-content {
    clear: both;
    background-color: #ffffff;
    color: inherit;
    padding: 15px 20px 20px 20px;
    border-color: #e7eaec;
    border-image: none;
    border-style: solid solid none;
    border-width: 1px 0;
    margin-right: 20px;
  }
  .table > tbody > tr > td, .table > tfoot > tr > td {
    border-top: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 8px;
    vertical-align: top;
  }
  .no-borders-tr td {
    border-top: none !important;
  }
  .no-borders {
    border: none !important;
  }
  .ibox-title {
    -moz-border-bottom-colors: none;
    -moz-border-left-colors: none;
    -moz-border-right-colors: none;
    -moz-border-top-colors: none;
    background-color: #ffffff;
    border-color: #e7eaec;
    border-image: none;
    color: inherit;
    margin-bottom: 0;
    margin-right: 20px;
    padding: 10px 15px 7px;
    min-height: 38px;
  }
  // ElEMENT 样式重置
  .el-tabs /deep/ .el-tabs__header{
    margin:0 !important;
  }
  .el-tabs /deep/ .el-tabs__item.is-active{
    background-color:#ffffff  !important;
  }
</style>
