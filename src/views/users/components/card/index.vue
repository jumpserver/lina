<template>
  <el-row>
    <el-col :span="4" :offset="16" class="top-btn">
      <el-button type="text" disabled><i class="fa fa-trash-o" />{{ $t('usergroup.delete') }}</el-button>

    </el-col>
    <el-col :span="4" class="top-btn">
      <el-button type="text" disabled><i class="fa fa-edit" />{{ $t('usergroup.update') }}</el-button>
    </el-col>
    <el-col :span="24">
      <div class="panel panel-info">
        <div class="panel-heading">
          <i class="fa fa-info-circle" /> {{ $t('usergroup.user') }}
        </div>
        <div class="panel-body">
          <table class="table group_edit">
            <tbody>
              <form />
              <tr>
                <td>
                  <el-select v-model="value1" multiple :placeholder="$t('usergroup.add_user')" style="width:100%" size="small">
                    <el-option
                      v-for="item in options"
                      :key="item.id"
                      :label="item.name"
                      :value="item.name"
                    />
                  </el-select>
                </td>
              </tr>
              <tr>
                <td colspan="2" class="no-borders">
                  <button id="btn_join_group" type="button" class="btn-bs btn-info btn-small">{{ $t('usergroup.add') }}</button>
                </td>
              </tr>
              <tr>
                <td>
                  <b class="bdg_group">Default</b>
                </td>
                <td>
                  <button class="btn btn-danger pull-right btn-xs btn_leave_group" data-uid="eb430762-22d3-4cfa-a86c-0d50b4013b8c" type="button"><i class="fa fa-minus" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
 .el-breadcrumb {
  padding: 20px;
  background-color: #fff;
}
  .side /deep/ .el-icon--right {
    margin-left: 96px !important;
}
  .el-tabs /deep/ .el-tabs__header{
    margin:0 !important;
  }
  .el-tabs /deep/ .el-tabs__item.is-active{
    background-color:#ffffff  !important;
  }
  .table{
    width: 100%;
    max-width: 100%;
    margin-bottom: 20px;
  }
  .content-main{
    text-align: start;
    width: 98%;
    margin-left:1% !important;
    margin-top: 1%;
    margin-bottom: 1%;
  }
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
  .panel {
    margin-bottom: 20px;
    border-color: #1ab394;
    background-color: #fff;
    border: 1px solid transparent;
    border-radius: 4px;
    -webkit-box-shadow: 0 1px 1px rgba(0,0,0,.05);
    box-shadow: 0 1px 1px rgba(0,0,0,.05);
  }
  .panel-primary > .panel-heading {
    background-color: #1ab394;
    border-color: #1ab394;
  }
  .panel-primary > .panel-heading {
    color: #fff;
  }
  .panel-heading {
    padding: 10px 15px;
    border-bottom: 1px solid transparent;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }
  .panel-info > .panel-heading {
    background-color: #23c6c8;
    border-color: #23c6c8;
    color: #ffffff;
  }
  .table > tbody > tr > td, .table > tfoot > tr > td {
    border-top: 1px solid #e7eaec;
    line-height: 1.42857;
    padding: 8px;
    vertical-align: top;
  }
  .btn {
    border-radius: 3px;
  }
  .btn-info {
    background-color: #23c6c8;
    border-color: #23c6c8;
    color: #FFFFFF;
  }
  .btn-xs, .btn-group-xs>.btn {
    padding: 1px 5px;
    font-size: 12px;
    line-height: 1.5;
    border-radius: 3px;
  }
  .top-btn{
    text-align: end;
  }
  .btn-bs {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
  }

</style>
