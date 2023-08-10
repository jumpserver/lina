<template>
  <el-row :gutter="20">
    <el-col :md="8" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="16" :sm="24">
      <IBox title="README">
        <vue-markdown v-if="object.readme" :source="object.readme" />
        <span v-else>{{ $tc('common.NoData') }}</span>
      </IBox>
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import VueMarkdown from 'vue-markdown'
import { IBox } from '@/components'

export default {
  name: 'Detail',
  components: {
    IBox,
    VueMarkdown,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/terminal/applets/${this.object.id}`,
      detailFields: [
        {
          key: '',
          formatter: () => {
            return <img src={this.object.icon} alt='' height='40'/>
          }
        },
        'name', 'display_name', 'author',
        {
          key: this.$t('assets.Protocols'),
          formatter: () => {
            const types = ['primary', 'success', 'warning', 'danger']
            const data = this.object.protocols.map((p, i) => {
              return <el-tag type={types[i % 4]} size='mini'>{p}</el-tag>
            })
            return <span> {data} </span>
          }
        },
        {
          key: this.$t('assets.Label'),
          formatter: () => {
            const types = ['primary', 'success', 'warning', 'danger']
            const data = this.object.tags.map((p, i) => {
              return <el-tag type={types[i % 4]} size='mini'>{p}</el-tag>
            })
            return <span> {data} </span>
          }
        },
        {
          key: this.$t('assets.Type'),
          value: this.object.type.label
        },
        {
          key: this.$t('common.Activate'),
          formatter: () => {
            return <el-switch
              v-model={this.object.is_active}
              disabled={!vm.$hasPerm('terminal.change_applet')}
              onChange={(v) => {
                const url = `/api/v1/terminal/applets/${vm.object.id}/`
                const data = { is_active: v }
                vm.$axios.patch(url, data).catch(() => {
                  this.object.is_active = !v
                }).then(res => {
                  vm.$message.success(vm.$t('common.updateSuccessMsg'))
                }).catch(err => {
                  vm.$message.error(vm.$t('common.updateErrorMsg' + ' ' + err))
                })
              }}
            />
          }
        },
        'edition', 'can_concurrent',
        'date_created', 'date_updated', 'comment'
      ]
    }
  },
  computed: {},
  mounted() {
  },
  methods: {}
}
</script>

<style lang='scss' scoped>
</style>
