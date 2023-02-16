<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :object="object" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard ref="users" v-bind="userRelationConfig" />
      <RelationCard ref="userGroups" type="info" v-bind="userGroupsRelationConfig" class="card-margin" />
      <RelationCard ref="applications" type="warning" v-bind="applicationsRelationConfig" class="card-margin" />
      <RelationCard ref="systemUsers" type="danger" v-bind="systemUserRelationConfig" class="card-margin" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
import RelationCard from '@/components/RelationCard'
export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const disabled = !this.$hasPerm('assets.change_commandfilter')
    const defaultTransformOption = (item, filed) => {
      const currentFiled = item[filed] ? item[filed] : filed === 'username' ? '*' : ''
      return { label: item.name + '(' + currentFiled + ')', value: item.id }
    }
    return {
      userRelationConfig: {
        disabled,
        icon: 'fa-user',
        title: this.$t('common.User'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini',
          transformOption: (item) => defaultTransformOption(item, 'username')
        },
        hasObjectsId: this.object.users,
        performAdd: item => this.performAddHandle(item, 'users'),
        performDelete: item => this.performDeleteHandle(item, 'users')
      },
      userGroupsRelationConfig: {
        disabled,
        icon: 'fa-users',
        title: this.$t('users.UserGroups'),
        objectsAjax: {
          url: '/api/v1/users/groups/'
        },
        hasObjectsId: this.object.user_groups,
        performAdd: item => this.performAddHandle(item, 'user_groups'),
        performDelete: item => this.performDeleteHandle(item, 'user_groups')
      },
      applicationsRelationConfig: {
        disabled,
        icon: 'fa-th',
        title: this.$t('assets.Applications'),
        objectsAjax: {
          url: `/api/v1/applications/applications/?category__in=db,cloud`,
          transformOption: (item) => defaultTransformOption(item, 'type_display')
        },
        hasObjectsId: this.object.applications,
        performAdd: item => this.performAddHandle(item, 'applications'),
        performDelete: item => this.performDeleteHandle(item, 'applications')
      },
      systemUserRelationConfig: {
        disabled,
        icon: 'fa-info-circle',
        title: this.$t('assets.SystemUser'),
        objectsAjax: {
          url: `/api/v1/assets/system-users/?protocol__in=ssh,telnet,mysql,postgresql,mariadb,oracle,sqlserver,k8s,redis,mongodb,clickhouse_tcp`,
          transformOption: (item) => defaultTransformOption(item, 'username')
        },
        hasObjectsId: this.object.system_users,
        performAdd: item => this.performAddHandle(item, 'system_users'),
        performDelete: item => this.performDeleteHandle(item, 'system_users')
      },
      url: '/api/v1/assets/cmd-filters/'
    }
  },
  computed: {
  },
  methods: {
    performAddHandle(item, updateField) {
      const newDatas = []
      const updateFieldRef = _.camelCase(updateField)
      const options = this.$refs[updateFieldRef].iHasObjects
      const relationUrl = `/api/v1/assets/cmd-filters/${this.object.id}/`
      options.forEach(v => newDatas.push(v.value))
      item.forEach(v => newDatas.push(v.value))

      return this.$axios.patch(relationUrl, { [updateField]: newDatas })
    },
    performDeleteHandle(item, updateField) {
      const newDatas = []
      const itemId = item?.value || ''
      const updateFieldRef = _.camelCase(updateField)
      const options = this.$refs[updateFieldRef].iHasObjects
      const relationUrl = `/api/v1/assets/cmd-filters/${this.object.id}/`
      options.forEach(v => {
        if (v.value !== itemId) {
          newDatas.push(v.value)
        }
      })

      return this.$axios.patch(relationUrl, { [updateField]: newDatas })
    }
  }
}
</script>

<style lang='less' scoped>
  .card-margin {
    margin-top: 15px;
  }
</style>
