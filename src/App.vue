<template>
	<div class="font-sans" :class="{ dark: isDarkMode }">
		<MoLangInput :embedded="embedded" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MoLangInput from './components/MoLangInput.vue'
import Button from './components/Button.vue'

const isDarkMode = ref(true)
const embedded = window.location !== window.parent.location

onMounted(() => {
	window.addEventListener('message', (event) => {
		if (event.data.type === 'set-color') {
			document.documentElement.style.setProperty(
				event.data.colorName,
				event.data.colorValue
			)
		} else if (event.data.type === 'set-highlighter') {
			const { color, background, textDecoration, isItalic } =
				event.data.highlighterData ?? {}
			const name = event.data.highlighterName

			document.documentElement.style.setProperty(
				`--v-${name}-base`,
				color
			)
			document.documentElement.style.setProperty(
				`--v-${name}-background`,
				background
			)
			document.documentElement.style.setProperty(
				`--v-${name}-font-style`,
				`${isItalic ? 'italic ' : ''}${textDecoration}`
			)
		} else if (event.data.type === 'set-dark-mode') {
			isDarkMode.value = event.data.isDarkMode
		}
	})
})
</script>
