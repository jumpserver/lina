<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <AutoPushCard v-bind="AutoPushConfig" />
      <RelationCard v-if="object.protocol === 'ssh'" ref="RelationCard" type="info" style="margin-top: 15px" v-bind="nodeRelationConfig" />
    </el-col>
  </el-row>
</template>a

<script>
import DetailCard from '@/components/DetailCard'
import AutoPushCard from './AutoPushCard'
import RelationCard from '@/components/RelationCard/index'

export default {
  name: 'Detail',
  components: {
    DetailCard,
    AutoPushCard,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      AutoPushConfig: {
        icon: 'fa-info',
        title: this.$t('assets.QuickUpdate'),
        url: `/api/v1/assets/system-users/${this.object.id}/`,
        content: [
          {
            name: this.$t('assets.AutoPush'),
            auto_push: this.object.auto_push
          }
        ]
      },
      nodeRelationConfig: {
        icon: 'fa-info',
        hasObjectsId: this.object.cmd_filters,
        title: this.$t('assets.CmdFilter'),
        objectsAjax: {
          url: '/api/v1/assets/cmd-filters/'
        },
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/assets/system-users/${objectId}/`
          const objectOldRelationCmdFilters = this.object.cmd_filters
          items.map(v => objectOldRelationCmdFilters.push(v.value))
          const data = { cmd_filters: objectOldRelationCmdFilters }
          return this.$axios.patch(relationUrl, data)
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/assets/system-users/${objectId}/`
          const objectOldRelationCmdFilters = this.object.cmd_filters
          const objectNewRelationCmdFilters = objectOldRelationCmdFilters.filter(v => v !== item.value)
          const data = { cmd_filters: objectNewRelationCmdFilters }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          // setTimeout(() => location.reload(), 300)
        },
        onDeleteSuccess: (obj, that) => {
          const theRemoveIndex = that.iHasObjects.findIndex((v) => v.value === obj.value)
          that.iHasObjects.splice(theRemoveIndex, 1)
          while (that.select2.disabledValues.indexOf(obj.value) !== -1) {
            const i = that.select2.disabledValues.indexOf(obj.value)
            this.$log.debug('disabled values remove index: ', i)
            that.select2.disabledValues.splice(i, 1)
          }
          this.$message.success(this.$t('common.deleteSuccessMsg'))
          // setTimeout(() => location.reload(), 300)
        }
      }
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('assets.Name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.Username'),
          value: this.object.username
        },
        {
          key: this.$t('assets.LoginModel'),
          value: this.object.login_mode_display
        },
        {
          key: 'Sudo',
          value: this.object.sudo
        },
        {
          key: 'Shell',
          value: this.object.shell
        },
        {
          key: this.$t('assets.date_joined'),
          value: '暂时没有这个API'
        },
        {
          key: this.$t('assets.CreatedBy'),
          value: '暂时没有这个API'
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
