import { getRandomColor } from '@/utils/common/color'
import { normalizeLabelFormErrors } from './utils'

export const LABEL_CREATE_URL = '/api/v1/labels/labels/'

export const LABEL_COLOR_PREDEFINES = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  '#ff69b4',
  '#ffffff',
  '#000000',
  '#f4a460',
  '#d2691e',
  '#8b4513',
  '#556b2f',
  '#2e8b57',
  '#4682b4',
  '#800080',
  '#ff00ff'
]

export function getLabelCreateFormConfig(vm, { compact = false, stayOnSuccess = false } = {}) {
  const submitOnlyRequiredRule = {
    required: true,
    message: vm.$t('FieldRequiredError'),
    trigger: 'submit'
  }
  const config = {
    initial: {
      color: getRandomColor()
    },
    fields: compact
      ? [['', ['name', 'value', 'color']]]
      : [
          [vm.$t('Basic'), ['name', 'value', 'color']],
          [vm.$t('Other'), ['comment']]
        ],
    continueCleanFields: ['name', 'value'],
    url: LABEL_CREATE_URL,
    hasDetailInMsg: false,
    onPerformError(error, method, formVm) {
      const response = error.response
      const data = normalizeLabelFormErrors(response?.data)
      if (response?.status === 400 && data && typeof data === 'object') {
        formVm.$refs.form.setErrors(data)
      }
      if (!compact) {
        vm.$emit('performError', data)
      }
    },
    fieldsMeta: {
      ...(compact && {
        name: {
          label: vm.$t('LabelKey'),
          el: {
            placeholder: vm.$t('LabelKeyPlaceholder')
          },
          rules: [submitOnlyRequiredRule]
        },
        value: {
          label: vm.$t('LabelValue'),
          el: {
            placeholder: vm.$t('LabelValuePlaceholder')
          },
          rules: [submitOnlyRequiredRule]
        }
      }),
      color: {
        component: 'el-color-picker',
        el: {
          size: 'small',
          predefine: LABEL_COLOR_PREDEFINES
        }
      }
    }
  }

  if (compact) {
    Object.assign(config, {
      hasReset: false,
      hasSaveContinue: false,
      needGetObjectDetail: false,
      createSuccessMsg: 'LabelCreateSuccess',
      submitBtnText: vm.$t('CreateLabel'),
      submitMethod: 'post'
    })
  }

  if (stayOnSuccess) {
    config.onPerformSuccess = function (res, method) {
      this.$emit('submitSuccess', res)
      this.emitPerformSuccessMsg(method, res, false)
    }
  }

  return config
}
