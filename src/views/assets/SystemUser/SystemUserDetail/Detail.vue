<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
      <RelationCard
        v-if="!(object.protocol === 'rdp' || object.protocol === 'vnc')"
        ref="RelationCard"
        v-bind="nodeRelationConfig"
        type="info"
        style="margin-top: 15px"
      />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import RelationCard from '@/components/RelationCard/index'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'Detail',
  components: {
    DetailCard,
    QuickActions,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      quickActions: [
        {
          title: this.$t('assets.AutoPush'),
          type: 'switcher',
          attrs: {
            label: this.$t('assets.AutoPush'),
            model: this.object.auto_push,
            disabled: (['rdp', 'ssh'].indexOf(this.object.protocol) === -1 || this.object.type === 'admin') ||
              !vm.$hasPerm('assets.change_systemuser')
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/assets/system-users/${this.object.id}/`,
                { auto_push: val }
              ).then(res => {
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        }
      ],
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
          // setTimeout(() => location.reload(), 300)
          this.$message.success(this.$t('common.updateSuccessMsg'))
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
          key: this.$t('assets.Type'),
          value: this.object.type_display
        },
        {
          key: this.$t('assets.Username'),
          value: this.object.username
        },
        {
          key: this.$t('assets.sshKeyFingerprint'),
          value: this.object['ssh_key_fingerprint']
        },
        {
          key: this.$t('assets.Protocol'),
          value: this.object.protocol
        },
        {
          key: this.$t('assets.LoginModel'),
          value: this.object['login_mode_display']
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
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('assets.CreatedBy'),
          value: this.object.created_by
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
