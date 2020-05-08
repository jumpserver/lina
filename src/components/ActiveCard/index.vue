<template>
  <IBox :fa="icon" :type="type" :title="title" v-bind="$attrs">
    <el-table class="el-table" :data="content" :show-header="false">
      <el-table-column prop="name" />
      <el-table-column prop="is_active" align="right">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.is_active"
            active-color="#1ab394"
            inactive-color="#ff4949"
            @change="HandleChangeAction(scope.$index, scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
export default {
  name: 'ActiveCard',
  components: {
    IBox
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    content: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    HandleChangeAction(index, row) {
      this.$axios.patch(this.url, { is_active: row.is_active }
      ).then(res => {
        this.$message.success(this.$tco('Update success'))
      }).catch(err => {
        this.$message.error(this.$tco('Update failed' + ' ' + err))
      })
    }
  }
}
</script>

<style scoped>

</style>
