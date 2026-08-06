<template>
  <section v-if="cards.length" class="result-cards">
    <details
      v-for="(card, index) in cards"
      :key="cardKey(card, index)"
      class="result-card"
      :open="cardOpened(card, index)"
      @toggle="handleToggle(card, index, $event)"
    >
      <summary class="result-card__header">
        <strong>{{ card.title || t('ChatAIResult') }}</strong>
        <span class="result-card__source">
          <small>{{ sourceLabel(card.source) }}</small>
          <el-icon><ArrowDown /></el-icon>
        </span>
      </summary>

      <div class="result-card__body">
        <div v-if="card.type === 'sources'" class="source-list">
          <template v-for="(source, sourceIndex) in sources(card)" :key="source.url || sourceIndex">
            <a
              v-if="safeUrl(source.url)"
              :href="safeUrl(source.url)"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>{{ source.title || source.url }}</span>
              <el-icon><TopRight /></el-icon>
            </a>
            <span v-else>{{ source.title || source.url }}</span>
          </template>
        </div>

        <div v-else-if="isTabular(card)" class="result-table-wrap">
          <table class="result-table">
            <thead>
              <tr>
                <th v-for="column in columns(card)" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in rows(card)" :key="rowIndex">
                <td v-for="column in columns(card)" :key="column">
                  {{ formatValue(row?.[column]) }}
                </td>
              </tr>
            </tbody>
          </table>
          <small v-if="card.content?.total > rows(card).length" class="result-total">
            {{ t('ChatAIResultTotal', { count: card.content.total }) }}
          </small>
        </div>

        <dl v-else-if="entries(card).length" class="result-details">
          <template
            v-for="([key, value], entryIndex) in entries(card)"
            :key="`${key}-${entryIndex}`"
          >
            <dt>{{ key }}</dt>
            <dd>{{ formatValue(value) }}</dd>
          </template>
        </dl>

        <pre v-else class="result-value">{{ formatValue(card.content) }}</pre>
      </div>
    </details>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDown, TopRight } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

defineProps({
  cards: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
const cardOpenState = ref({})

function cardKey(card, index) {
  const source = card?.source || {}
  return `${card?.type || 'result'}:${source.operation_id || card?.title || index}:${index}`
}

function shouldCollapse(card) {
  if (card?.type !== 'detail') return false
  if (card?.content?.truncated) return true
  return formatValue(card?.content).length > 500
}

function cardOpened(card, index) {
  const key = cardKey(card, index)
  if (Object.prototype.hasOwnProperty.call(cardOpenState.value, key)) {
    return cardOpenState.value[key]
  }
  return !shouldCollapse(card)
}

function handleToggle(card, index, event) {
  cardOpenState.value = {
    ...cardOpenState.value,
    [cardKey(card, index)]: event.currentTarget.open
  }
}

function sourceLabel(source = {}) {
  if (source.type === 'web_search') return source.provider || t('ChatAIWebSearch')
  return [source.method, source.path].filter(Boolean).join(' ') || t('ChatAIResultSource')
}

function sources(card) {
  return Array.isArray(card?.content?.sources) ? card.content.sources : []
}

function safeUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

function isTabular(card) {
  return ['table', 'timeline'].includes(card?.type) && columns(card).length > 0
}

function columns(card) {
  return Array.isArray(card?.content?.columns) ? card.content.columns : []
}

function rows(card) {
  return Array.isArray(card?.content?.rows) ? card.content.rows : []
}

function entries(card) {
  const content = card?.content
  if (!content || Array.isArray(content) || typeof content !== 'object') return []
  return Object.entries(content).slice(0, 20)
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
</script>

<style lang="scss" scoped>
.result-cards {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.result-card {
  overflow: hidden;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  background: #fff;

  &[open] .result-card__header {
    border-bottom-color: #edf0f4;
  }

  &[open] .result-card__source .el-icon {
    transform: rotate(180deg);
  }

  &__header {
    display: flex;
    min-height: 38px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 11px;
    border-bottom: 1px solid transparent;
    background: #f8fafb;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    strong {
      overflow: hidden;
      color: #454b5c;
      font-size: 11px;
      font-weight: 650;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__source {
    display: inline-flex;
    min-width: 0;
    align-items: center;
    gap: 6px;

    small {
      overflow: hidden;
      color: #9298a7;
      font-size: 9px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-icon {
      flex: 0 0 auto;
      color: #a0a5b2;
      font-size: 11px;
      transition: transform 0.18s ease;
    }
  }

  &__body {
    min-width: 0;
  }
}

.source-list {
  display: grid;
  gap: 1px;
  padding: 6px;

  a,
  > span {
    display: flex;
    min-height: 32px;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 5px;
    color: #4d6070;
    font-size: 10px;
    text-decoration: none;
  }

  a:hover {
    color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-light, #e8f7f3);
  }
}

.result-table-wrap {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;

  th,
  td {
    max-width: 260px;
    padding: 7px 9px;
    overflow-wrap: anywhere;
    text-align: left;
    vertical-align: top;
  }

  th {
    color: #737b8d;
    background: #fbfcfd;
    font-weight: 650;
    white-space: nowrap;
  }

  td {
    border-top: 1px solid #f0f2f5;
    color: #4d5364;
  }
}

.result-total {
  display: block;
  padding: 6px 9px 8px;
  color: #9298a7;
  font-size: 9px;
}

.result-details {
  display: grid;
  grid-template-columns: minmax(90px, 0.35fr) minmax(0, 1fr);
  margin: 0;
  padding: 7px 10px 10px;
  font-size: 10px;

  dt,
  dd {
    margin: 0;
    padding: 5px 0;
    border-bottom: 1px solid #f1f3f5;
    overflow-wrap: anywhere;
  }

  dt {
    padding-right: 10px;
    color: #858c9d;
  }

  dd {
    color: #4d5364;
  }
}

.result-value {
  margin: 0;
  padding: 10px;
  overflow: auto;
  color: #4d5364;
  background: #fff;
  font-family: inherit;
  font-size: 10px;
  white-space: pre-wrap;
}
</style>
