<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <GenericListTable ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="memberRelationConfig" class="RelationCard">
        <el-radio-group v-model="defaultOrgRole" style="padding: 8px">
          <el-radio v-for="item in group" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </RelationCard>
    </el-col>
  </el-row>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import RelationCard from '@/components/RelationCard'
import { DeleteActionFormatter } from '@/components/TableFormatters'

export default {
  name: 'OrganizationMembershipList',
  components: {
    GenericListTable,
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
      defaultOrgRole: 'User',
      group: [
        {
          label: this.$t('users.OrgAdmin'),
          value: 'Admin'
        }, {
          label: this.$t('users.OrgAuditor'),
          value: 'Auditor'
        }, {
          label: this.$t('users.OrgUser'),
          value: 'User'
        }
      ],
      tableConfig: {
        url: `/api/v1/orgs/org-member-relation/?org_id=${this.object.id}`,
        columns: [
          'user_display', 'role_display', 'delete_action'
        ],
        columnsMeta: {
          user_display: {
            label: this.$t('common.Name')
          },
          role_display: {
            label: this.$t('xpack.Organization.OrgRole'),
            width: 150
          },
          delete_action: {
            prop: 'id',
            label: this.$t('common.Actions'),
            align: 'center',
            width: 80,
            objects: 'all',
            formatter: DeleteActionFormatter,
            hasBackSlash: true,
            deleteUrl: `/api/v1/orgs/org-member-relation/?id=`
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false
      },
      memberRelationConfig: {
        icon: 'fa-user',
        title: this.$t('xpack.Organization.AddOrgMembers'),
        showHasMore: false,
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name&all=1',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.users,
        showHasObjects: false,
        performAdd: (items) => {
          const relationUrl = `/api/v1/orgs/org-member-relation/`
          const data = []
          for (const user of items) {
            data.push({ org: this.object.id, user: user.value, role: this.defaultOrgRole })
          }
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.GenericListTable.$refs.ListTable.reloadTable()
          window.location.reload()
        }
      }
    }
  },
  watch: {
    defaultOrgRole(value) {
      if (value === 'Admin') {
        this.$set(this.memberRelationConfig, 'hasObjectsId', this.object.admins)
      }
      if (value === 'Auditor') {
        this.$set(this.memberRelationConfig, 'hasObjectsId', this.object.auditors)
      }
      if (value === 'User') {
        this.$set(this.memberRelationConfig, 'hasObjectsId', this.object.users)
      }
    }
  }
}
</script>

<style scoped>
.RelationCard ::v-deep .CardTable{
  table-layout:inherit !important;
}
</style>
