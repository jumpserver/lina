<template>
  <el-row :gutter="20">
    <el-col :lg="10" :md="10" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" label-width="40%" />
    </el-col>
    <el-col :lg="14" :md="14" :sm="24">
      <IBox title="README">
        <vue-markdown v-if="object.readme" :source="object.readme" />
        <span v-else>{{ $tc('NoData') }}</span>
      </IBox>
    </el-col>
  </el-row>
</template>

<script>
import {
  createTextVNode as createTextVNodeCompat,
  isVNode as isVNodeCompat,
  resolveComponent as resolveComponentCompat,
  createVNode as createVNodeCompat
} from 'vue'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import VueMarkdown from '@/components/Widgets/VueMarkdown/index.vue'
import { IBox } from '@/components'
function _isSlot(s) {
  return (
    typeof s === 'function' ||
    (Object.prototype.toString.call(s) === '[object Object]' && !isVNodeCompat(s))
  )
}
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
      default: () => {}
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
            return createVNodeCompat(
              'img',
              {
                src: this.object.icon,
                alt: '',
                height: '40'
              },
              null
            )
          }
        },
        'name',
        'display_name',
        'author',
        {
          key: this.$t('Protocols'),
          formatter: () => {
            const types = ['primary', 'success', 'warning', 'danger']
            const data = this.object.protocols.map((p, i) => {
              return createVNodeCompat(
                resolveComponentCompat('el-tag'),
                {
                  type: types[i % 4],
                  size: 'small'
                },
                _isSlot(p)
                  ? p
                  : {
                      default: () => [p]
                    }
              )
            })
            return createVNodeCompat('span', null, [
              createTextVNodeCompat(' '),
              data,
              createTextVNodeCompat(' ')
            ])
          }
        },
        {
          key: this.$t('Tags'),
          formatter: () => {
            const types = ['primary', 'success', 'warning', 'danger']
            const data = this.object.tags.map((p, i) => {
              return createVNodeCompat(
                resolveComponentCompat('el-tag'),
                {
                  type: types[i % 4],
                  size: 'small'
                },
                _isSlot(p)
                  ? p
                  : {
                      default: () => [p]
                    }
              )
            })
            return createVNodeCompat('span', null, [
              createTextVNodeCompat(' '),
              data,
              createTextVNodeCompat(' ')
            ])
          }
        },
        {
          key: this.$t('Type'),
          value: this.object.type.label
        },
        {
          key: this.$t('Active'),
          formatter: () => {
            return createVNodeCompat(
              resolveComponentCompat('el-switch'),
              {
                modelValue: this.object.is_active,
                'onUpdate:modelValue': ($event) => (this.object.is_active = $event),
                disabled: !vm.$hasPerm('terminal.change_applet'),
                onChange: (v) => {
                  const url = `/api/v1/terminal/applets/${vm.object.id}/`
                  const data = {
                    is_active: v
                  }
                  vm.$axios
                    .patch(url, data)
                    .catch(() => {
                      this.object.is_active = !v
                    })
                    .then((res) => {
                      vm.$message.success(vm.$t('UpdateSuccessMsg'))
                    })
                    .catch((err) => {
                      vm.$message.error(vm.$t('UpdateErrorMsg' + ' ' + err))
                    })
                }
              },
              null
            )
          }
        },
        'edition',
        'can_concurrent',
        'date_created',
        'date_updated',
        'comment'
      ]
    }
  },
  computed: {},
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped></style>
