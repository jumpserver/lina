<template>
  <span
    :class="['assistant-mark', `assistant-mark--${size}`, { 'is-active': active }]"
    :style="faceStyle"
    aria-hidden="true"
  >
    <span class="assistant-mark__core">
      <svg viewBox="0 0 54 57" fill="none" focusable="false">
        <defs>
          <linearGradient
            :id="faceGradientId"
            x1="8"
            y1="7"
            x2="46"
            y2="43"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="var(--mark-highlight)" />
            <stop offset=".65" stop-color="var(--mark-face)" />
            <stop offset="1" stop-color="var(--mark-face-shade)" />
          </linearGradient>
          <linearGradient
            :id="edgeGradientId"
            x1="5"
            y1="5"
            x2="48"
            y2="49"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="var(--mark-edge-light)" />
            <stop offset="1" stop-color="var(--mark-edge)" />
          </linearGradient>
        </defs>
        <ellipse
          class="assistant-mark__shadow"
          cx="25"
          cy="56"
          rx="11"
          ry="1"
          fill="var(--mark-edge)"
        />
        <g class="assistant-mark__robot">
          <!-- Preserve the original speech-bubble silhouette and its two round eyes. -->
          <!-- Global path styles inherit fill, so keep the face fill on its parent. -->
          <g :fill="`url(#${faceGradientId})`">
            <path
              d="M16 4H38C45.7 4 49.5 9 49.5 16.5V31C49.5 37.5 45.4 40.5 38.5 40.5H34L23 51V40.5H16C8 40.5 4.5 36.3 4.5 29V17C4.5 9 8.5 4 16 4Z"
              :stroke="`url(#${edgeGradientId})`"
              stroke-width="3.5"
              stroke-linejoin="round"
            />
          </g>
          <path
            d="M8 29V17C8 10.5 11 7.5 17 7.5H38C42 7.5 44.5 9 46 12"
            stroke="white"
            stroke-opacity=".25"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <g class="assistant-mark__eyes" fill="var(--mark-eye)">
            <circle cx="20" cy="21.5" r="3" />
            <circle cx="33" cy="21.5" r="3" />
          </g>
        </g>
      </svg>
    </span>
  </span>
</template>

<script setup>
import { computed, useId } from 'vue'
import { useStore } from 'vuex'
import defaultThemeConfig from '@/styles/default-theme'
import { getAssistantFacePrimaryWeight } from '../utils/assistantColors'

defineProps({
  active: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium'
  }
})

const markId = useId()
const faceGradientId = `${markId}-face`
const edgeGradientId = `${markId}-edge`
const store = useStore()
const faceStyle = computed(() => {
  const primaryColor =
    store.state.settings.themeColors['--color-primary'] || defaultThemeConfig['--color-primary']
  return { '--mark-face-weight': `${getAssistantFacePrimaryWeight(primaryColor)}%` }
})
</script>

<style lang="scss" scoped>
.assistant-mark {
  --mark-size: 34px;
  --mark-face-weight: 65%;
  --mark-highlight: color-mix(in srgb, currentColor calc(var(--mark-face-weight) - 15%), white);
  --mark-face: color-mix(in srgb, currentColor var(--mark-face-weight), white);
  --mark-face-shade: color-mix(in srgb, currentColor calc(var(--mark-face-weight) + 10%), white);
  --mark-edge-light: color-mix(in srgb, currentColor 46%, #071f20);
  --mark-edge: color-mix(in srgb, currentColor 28%, #071f20);
  --mark-eye: #111;
  position: relative;
  display: inline-flex;
  width: var(--mark-size);
  height: var(--mark-size);
  flex: 0 0 var(--mark-size);
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  pointer-events: none;

  &--small {
    --mark-size: 26px;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  &--large {
    --mark-size: 56px;
  }

  &__core {
    position: relative;
    z-index: 1;
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    filter: drop-shadow(0 2px 3px color-mix(in srgb, currentColor 20%, transparent));
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  &__robot {
    animation: mark-float 3.6s ease-in-out infinite;
  }

  &__eyes {
    transform-box: fill-box;
    transform-origin: center;
    animation: mark-blink 8s ease-in-out infinite;
  }

  &__shadow {
    transform-box: fill-box;
    transform-origin: center;
    animation: mark-shadow 3.6s ease-in-out infinite;
  }

  &.is-active {
    .assistant-mark__robot,
    .assistant-mark__shadow {
      animation-duration: 1.6s;
    }
  }
}

@keyframes mark-float {
  50% {
    transform: translateY(-1.5px);
  }
}

@keyframes mark-blink {
  0%,
  72%,
  80%,
  100% {
    transform: scaleY(1);
  }

  75%,
  77% {
    transform: scaleY(0.12);
  }
}

@keyframes mark-shadow {
  50% {
    opacity: 0.5;
    transform: scaleX(0.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-mark * {
    animation: none !important;
  }
}
</style>
