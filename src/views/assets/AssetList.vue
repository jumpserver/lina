<template>
  <Page>
    <template slot="content">
      <el-alert type="success"> 这里是一个成功的文案 </el-alert>
      <el-row>
        <el-col v-show="show3" :span="4">这里是节点树</el-col>
        <el-col :span="1" class="mini"><div style="display:block" class="mini-button" @click="show3=!show3"><i v-show="show3" id="toggle-icon" class="fa fa-angle-left fa-x" /><i v-show="!show3" class="fa fa-angle-right fa-x" /></div></el-col>
        <el-col :span="show3?19:23">
          <el-card >
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
import { getAssetList } from '@/api/asset'
export default {
  components: {
    Page,
    Tables
  },
  data() {
    return {
      show3: true,
      tableConfig: {
        getData: getAssetList,
        hasSelect: true,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.hostname'),
            key: 'hostname',
            link: 'AssetDetail',
            sortable: true
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            key: 'ip'
          },
          {
            prop: 'hardware',
            label: this.$t('assets.hardware'),
            key: 'hardware_info'
          },
          {
            prop: 'reachable',
            label: this.$t('assets.reachable'),
            key: 'connectivity'
          }
        ],
        // 写路由名字，table组件会自动传作为参数
        action: {
          hasEdit: 'AssetEdit',
          newClick: 'AssetEdit'
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
