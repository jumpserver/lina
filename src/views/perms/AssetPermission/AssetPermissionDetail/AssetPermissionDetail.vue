<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script>
import {
  createVNode as createVNodeCompat,
  isVNode as isVNodeCompat,
  resolveComponent as resolveComponentCompat
} from 'vue'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import { QuickActions } from '@/components'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
function _isSlot(s) {
  return (
    typeof s === 'function' ||
    (Object.prototype.toString.call(s) === '[object Object]' && !isVNodeCompat(s))
  )
}
export default {
  name: 'AssetPermissionDetail',
  components: {
    TwoCol,
    AutoDetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('Active'),
          type: 'switch',
          attrs: {
            model: this.object.is_active,
            disabled: !this.$hasPerm('perms.change_assetpermission')
          },
          callbacks: {
            change: function (val) {
              this.$axios
                .patch(`/api/v1/perms/asset-permissions/${this.object.id}/`, {
                  is_active: val
                })
                .then((res) => {
                  this.$message.success(this.$tc('UpdateSuccessMsg'))
                })
                .catch((err) => {
                  this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + err))
                })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/perms/asset-permissions/${this.object.id}`,
      detailFields: [
        'id',
        'name',
        {
          key: this.$t('Action'),
          value: this.object.actions,
          formatter(row, value) {
            const actionLabels = value.map((item) => item.label.replace(/ \([^)]*\)/, ''))
            return createVNodeCompat('div', null, [
              actionLabels.map((item) =>
                createVNodeCompat(
                  resolveComponentCompat('el-tag'),
                  {
                    size: 'small',
                    style: {
                      marginRight: '3px'
                    },
                    key: item
                  },
                  _isSlot(item)
                    ? item
                    : {
                        default: () => [item]
                      }
                )
              )
            ])
          }
        },
        'date_start',
        'date_expired',
        'date_created',
        'created_by',
        'comment'
      ]
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('DateStart'),
          value: this.object.date_start
        },
        {
          key: this.$t('DateExpired'),
          value: this.object.date_expired
        },
        {
          key: this.$t('DateCreated'),
          value: this.object.date_created
        },
        {
          key: this.$t('CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>
