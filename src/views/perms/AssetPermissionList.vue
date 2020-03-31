<template>
  <Page>
    <template slot="content">
      <el-alert type="success"> 这里是一个成功的文案 </el-alert>
      <el-row>
        <el-col v-show="show3" :span="4">这里是节点树</el-col>
        <el-col :span="1" class="mini"><div style="display:block" class="mini-button" @click="show3=!show3"><i v-show="show3" id="toggle-icon" class="fa fa-angle-left fa-x" /><i v-show="!show3" class="fa fa-angle-right fa-x" /></div></el-col>
        <el-col :span="show3?19:23">
          <el-card>
            <tables v-bind="tableConfig" />
          </el-card>
        </el-col>
      </el-row>
    </template>
  </Page>
</template>

<script>
import { Page } from '@/layout/components'
import Tables from '@/components/ListTables/table'
import { getAssetPermissionList } from '@/api/perms'
export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      show3: true,
      tableConfig: {
        getData: getAssetPermissionList,
        hasSelect: true,
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            key: 'name',
            link: 'AssetPermissionDetail',
            sortable: true
          },
          {
            prop: 'user',
            label: this.$t('perms.user'),
            key: 'users'
          },
          {
            prop: 'userGroup',
            label: this.$t('perms.userGroup'),
            key: 'user_groups'
          },
          {
            prop: 'asset',
            label: this.$t('perms.asset'),
            key: 'assets'
          },
          {
            prop: 'node',
            label: this.$t('perms.node'),
            key: 'nodes'
          },
          {
            prop: 'validity',
            label: this.$t('perms.validity'),
            key: 'is_valid'
          }
        ],
        // 写路由名字，table组件会自动传作为参数
        action: {
          hasEdit: 'AssetPermissionEdit',
          newClick: 'AssetPermissionEdit'
        }
      }
    }
  }
}
</script>

<style>
  .mini-button{
    width: 12px;
    float: right;
    text-align: center;
    padding: 5px 0;
    background-color: #1ab394;
    border-color: #1ab394;
    color: #FFFFFF;
    border-radius: 3px;
  }
  .mini{
    width: 12px !important;
  }
</style>
