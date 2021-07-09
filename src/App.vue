<template>
	<MoLangInput :embedded="embedded" :uuid="uuid" />
</template>

<script>
import MoLangInput from './components/MoLangInput.vue'

export default {
	name: 'App',
	components: {
		MoLangInput,
	},
	data: () => ({
		embedded: false,
		uuid: null,
	}),
	mounted() {
		window.addEventListener('message', (event) => {
			this.embedded = true

			if (event.data.type === 'set-uuid') this.uuid = event.data.uuid
			else if (event.data.type === 'set-color')
				document.documentElement.style.setProperty(
					event.data.colorName,
					event.data.colorValue
				)
			else if (event.data.type === 'set-highlighter') {
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
			}
		})
	},
}
</script>
