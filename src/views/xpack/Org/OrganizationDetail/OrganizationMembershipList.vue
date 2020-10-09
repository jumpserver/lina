<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="adminRelationConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="auditorRelationConfig" />
      <RelationCard type="warning" style="margin-top: 15px" v-bind="userRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import RelationCard from '@/components/RelationCard'
import { DeleteActionFormatter } from '@/components/ListTable/formatters'

export default {
  name: 'OrganizationMembershipList',
  components: {
    ListTable,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/orgs/org-memeber-relation/?org_id=${this.object.id}`,
        columns: [
          'user_display', 'role_display', 'delete_action'
        ],
        columnsMeta: {
          user_display: {
            label: this.$t('common.Name')
          },
          role_display: {
            label: this.$t('xpack.Organization.OrgRole')
          },
          delete_action: {
            prop: 'id',
            label: this.$t('common.Actions'),
            align: 'center',
            width: 150,
            objects: 'all',
            formatter: DeleteActionFormatter,
            hasBackSlash: true,
            deleteUrl: `/api/v1/orgs/org-memeber-relation/?id=`
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: true,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false
      },
      adminRelationConfig: {
        icon: 'fa-user',
        title: this.$t('xpack.Admin'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name&all=1',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.admins,
        showHasObjects: false,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectRelationAdmin = this.object.admins
          items.map(v => objectRelationAdmin.push(v.value))
          const data = { admins: objectRelationAdmin }
          return this.$axios.patch(relationUrl, data)
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectOldRelationAdmin = this.object.admins
          const objectNewRelationAdmin = objectOldRelationAdmin.filter(v => v !== item.value)
          const data = { admins: objectNewRelationAdmin }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        }
      },
      auditorRelationConfig: {
        icon: 'fa-user',
        title: this.$t('xpack.Auditor'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name&all=1',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.auditors,
        showHasObjects: false,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectRelationAuditors = this.object.auditors
          items.map(v => objectRelationAuditors.push(v.value))
          const data = { auditors: objectRelationAuditors }
          return this.$axios.patch(relationUrl, data)
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectOldRelationAuditors = this.object.auditors
          const objectNewRelationAuditors = objectOldRelationAuditors.filter(v => v !== item.value)
          const data = { auditors: objectNewRelationAuditors }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        }
      },
      userRelationConfig: {
        icon: 'fa-user',
        title: this.$t('xpack.User'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name&all=1',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.users,
        showHasObjects: false,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/orgs/orgs/${objectId}/`
          const objectRelationUsers = this.object.users
          items.map(v => objectRelationUsers.push(v.value))
          const data = { users: objectRelationUsers }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
