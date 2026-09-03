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
        <strong>{{ cardTitle(card) }}</strong>
        <span class="result-card__source">
          <small :title="sourceDescription(card.source)">{{ sourceLabel(card.source) }}</small>
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

        <div v-else-if="isAssetList(card)" class="asset-result-list">
          <article
            v-for="(row, rowIndex) in rows(card)"
            :key="row?._key || row?.id || rowIndex"
            class="asset-result"
          >
            <div class="asset-result__identity">
              <span class="asset-result__avatar">{{ assetInitial(row) }}</span>
              <span class="asset-result__name">
                <strong :title="formatValue(row?.name)">{{ formatValue(row?.name) }}</strong>
                <code :title="formatValue(row?.address)">{{ formatValue(row?.address) }}</code>
              </span>
            </div>
            <span
              v-if="typeof row?.is_active === 'boolean'"
              :class="['asset-result__status', { 'is-active': row.is_active }]"
            >
              <i /> {{ assetStatus(row) }}
            </span>
            <div class="asset-result__meta">
              <span v-if="row?.platform" :title="formatValue(row.platform)">
                {{ formatValue(row.platform) }}
              </span>
              <span v-if="row?.accounts_amount !== null && row?.accounts_amount !== undefined">
                {{ t('ChatAIAssetAccounts', { count: row.accounts_amount }) }}
              </span>
              <span class="asset-result__verified">
                {{ verifiedLabel(row?.date_verified) }}
              </span>
            </div>
          </article>
          <small v-if="card.content?.total > rows(card).length" class="result-total">
            {{ t('ChatAIResultTotal', { count: card.content.total }) }}
          </small>
        </div>

        <div v-else-if="isTabular(card)" class="result-table-wrap">
          <table class="result-table">
            <thead>
              <tr>
                <th v-for="column in columns(card)" :key="column">{{ fieldLabel(column) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in rows(card)" :key="rowIndex">
                <td v-for="column in columns(card)" :key="column">
                  {{ formatFieldValue(column, row?.[column]) }}
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
            <dt>{{ fieldLabel(key) }}</dt>
            <dd>{{ formatFieldValue(key, value) }}</dd>
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
const assetListOperations = new Set([
  'assets_assets_list',
  'assets_hosts_list',
  'assets_nodes_assets_list'
])

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

function isAssetList(card) {
  return card?.content?.variant === 'assets' || assetListOperations.has(card?.source?.operation_id)
}

function cardTitle(card) {
  if (isAssetList(card)) return t('ChatAIAssetsResult')
  return card?.title || t('ChatAIResult')
}

function sourceLabel(source = {}) {
  if (source.type === 'web_search') return source.provider || t('ChatAIWebSearch')
  return [t('ChatAIResultSource'), source.method].filter(Boolean).join(' · ')
}

function sourceDescription(source = {}) {
  if (source.type === 'web_search') return source.provider || t('ChatAIWebSearch')
  return [source.method, source.path].filter(Boolean).join(' ')
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

function assetInitial(row) {
  const name = String(row?.name || row?.address || '?').trim()
  return Array.from(name)[0]?.toUpperCase() || '?'
}

function assetStatus(row) {
  return row?.is_active === true ? t('ChatAIAssetActive') : t('ChatAIAssetInactive')
}

function compactDate(value) {
  if (!value) return ''
  const normalized = String(value)
    .replace(
      /^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}:\d{2}:\d{2})\s*([+-]\d{2})(\d{2})$/,
      '$1-$2-$3T$4$5:$6'
    )
    .replace(' ', 'T')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function verifiedLabel(value) {
  const date = compactDate(value)
  return date ? t('ChatAIAssetVerifiedAt', { time: date }) : t('ChatAIAssetNotVerified')
}

function entries(card) {
  const content = card?.content
  if (!content || Array.isArray(content) || typeof content !== 'object') return []
  return Object.entries(content).slice(0, 20)
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return value ? t('ChatAIYes') : t('ChatAINo')
  if (typeof value === 'number') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function fieldLabel(value) {
  const key = String(value || '')
  const known = {
    id: 'ID',
    name: t('ChatAIFieldName'),
    address: t('ChatAIFieldAddress'),
    username: t('ChatAIFieldUsername'),
    status: t('ChatAIFieldStatus'),
    is_active: t('ChatAIFieldActive'),
    date_created: t('ChatAIFieldDateCreated'),
    date_updated: t('ChatAIFieldDateUpdated'),
    org_name: t('ChatAIFieldOrganization'),
    platform: t('ChatAIFieldPlatform')
  }
  if (known[key]) return known[key]
  return key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatFieldValue(key, value) {
  if (value && /(^date_|_at$|_time$)/i.test(String(key))) {
    return compactDate(value)
  }
  return formatValue(value)
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
  border-radius: var(--ai-radius-md, 10px);
  background: #fff;
  box-shadow: 0 2px 8px rgb(31 49 43 / 4%);

  &[open] .result-card__header {
    border-bottom-color: #edf0f4;
  }

  &[open] .result-card__source .el-icon {
    transform: rotate(180deg);
  }

  &__header {
    display: flex;
    min-height: 42px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 11px;
    border-bottom: 1px solid transparent;
    background: #f8faf9;
    cursor: pointer;
    list-style: none;
    transition: background 0.16s ease;

    &:hover {
      background: var(--ai-surface-hover, #f1f7f5);
    }

    &:focus-visible {
      outline: 2px solid rgb(26 179 148 / 36%);
      outline-offset: -2px;
    }

    &::-webkit-details-marker {
      display: none;
    }

    strong {
      overflow: hidden;
      color: #454b5c;
      font-size: 12px;
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
      color: #737b87;
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-icon {
      flex: 0 0 auto;
      color: #747c89;
      font-size: 14px;
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

  .el-icon {
    flex: 0 0 auto;
    color: #667181;
    font-size: 14px;
  }

  a,
  > span {
    display: flex;
    min-height: 32px;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 8px;
    border-radius: var(--ai-radius-sm, 8px);
    color: #405464;
    font-size: 11px;
    text-decoration: none;
  }

  a:hover {
    color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-light, #e8f7f3);
  }

  a:focus-visible {
    outline: 2px solid rgb(26 179 148 / 36%);
    outline-offset: -2px;
  }
}

.result-table-wrap {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;

  th,
  td {
    max-width: 260px;
    padding: 7px 9px;
    overflow-wrap: normal;
    text-align: left;
    vertical-align: top;
    word-break: normal;
  }

  th {
    color: #737b8d;
    background: #f7f9f8;
    font-weight: 650;
    white-space: nowrap;
  }

  td {
    border-top: 1px solid #f0f2f5;
    color: #4d5364;
  }
}

.asset-result-list {
  display: grid;
}

.asset-result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 16px;
  padding: 12px 14px;
  border-bottom: 1px solid #edf1f3;
  transition: background-color 0.15s ease;

  &:last-of-type {
    border-bottom: 0;
  }

  &:hover {
    background: #fbfdfd;
  }

  &__identity {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
  }

  &__avatar {
    display: inline-flex;
    width: 30px;
    height: 30px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-light, #e8f7f3);
    font-size: 12px;
    font-weight: 700;
  }

  &__name {
    display: grid;
    min-width: 0;
    gap: 3px;

    strong,
    code {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: #343a46;
      font-size: 12px;
      font-weight: 650;
    }

    code {
      color: #747d8c;
      font-family: inherit;
      font-size: 11px;
    }
  }

  &__status {
    display: inline-flex;
    align-self: center;
    align-items: center;
    gap: 5px;
    padding: 3px 7px;
    border-radius: 999px;
    color: #8a5b2d;
    background: #fff6e8;
    font-size: 11px;
    font-weight: 600;

    i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #d98b32;
    }

    &.is-active {
      color: #217a67;
      background: #eaf7f3;

      i {
        background: #2fb496;
      }
    }
  }

  &__meta {
    display: flex;
    min-width: 0;
    grid-column: 1 / -1;
    align-items: center;
    gap: 7px;
    padding-left: 40px;
    color: #7f8795;
    font-size: 11px;

    > span:not(.asset-result__verified) {
      max-width: 160px;
      padding: 2px 6px;
      overflow: hidden;
      border: 1px solid #e7eaee;
      border-radius: 6px;
      background: #fafbfc;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__verified {
    margin-left: auto;
    white-space: nowrap;
  }
}

@media (max-width: 640px) {
  .asset-result {
    &__meta {
      flex-wrap: wrap;
    }

    &__verified {
      width: 100%;
      margin-left: 0;
    }
  }
}

.result-total {
  display: block;
  padding: 6px 9px 8px;
  color: #737b87;
  font-size: 11px;
}

.result-details {
  display: grid;
  grid-template-columns: minmax(90px, 0.35fr) minmax(0, 1fr);
  margin: 0;
  padding: 7px 10px 10px;
  font-size: 11px;

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
  font-size: 11px;
  white-space: pre-wrap;
}
</style>
