<template>
  <Dialog
    ref="myDialog"
    :destroy-on-close="true"
    width="770px"
    height="700px"
    v-bind="$attrs"
    @confirm="submit"
    v-on="$listeners"
  >
    <krryPaging ref="pageTransfer" v-bind="pagingTransfer" class="transfer" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { krryPaging } from 'krry-transfer'
import { getUserList } from '@/api/users'
export default {
  name: 'ListSelect',
  components: {
    Dialog, krryPaging
  },
  inheritAttrs: false,
  props: {
    selectedUsers: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      pagingTransfer: {
        pageSize: 10,
        filterable: true,
        async: true,
        dataList: [],
        getPageData: async function(pageIndex, pageSize) {
          const limit = pageSize
          const offset = (pageIndex - 1) * pageSize
          const params = {
            'limit': limit,
            'offset': offset,
            'oid': 'ROOT'
          }
          const data = await getUserList(params)
          const results = data['results'].map(item => {
            return { id: item.id, label: `${item.name}(${item.username})` }
          })
          return results
        },
        getSearchData: async function(keyword, pageIndex, pageSize) {
          const limit = pageSize
          const offset = (pageIndex - 1) * pageSize
          const params = {
            'limit': limit,
            'offset': offset,
            'oid': 'ROOT',
            'search': keyword
          }
          const data = await getUserList(params)
          const results = data['results'].map(item => {
            return { id: item.id, label: `${item.name}(${item.username})` }
          })
          return results
        },
        selectedData: [],
        showClearBtn: true
      }
    }
  },
  mounted() {
    const selectedUsers = this.selectedUsers.map(item => {
      return {
        id: item.id,
        label: item.name
      }
    })
    setTimeout(() => {
      this.pagingTransfer.selectedData = selectedUsers
    }, 500)
  },
  methods: {
    submit() {
      const selectedUsersId = this.$refs.pageTransfer.getSelectedData()
      this.$emit('submit', selectedUsersId)
    }
  }
}
</script>

<style lang="scss" scoped>
.transfer {
  padding-left: 10px;
}

.transfer >>> .district-panel {
  width: 300px;

  .el-transfer-panel__body {
    height: 360px;
  }

  .el-checkbox-group {
    height: 360px;
  }
}

.transfer >>> .el-transfer-panel__item:hover {
  color: #428bca;
}

.transfer >>> .el-checkbox {
  font-weight: normal;
}
</style>
