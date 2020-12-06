<template>
	<PrismEditor
		class="molang-editor"
		v-model="code"
		:highlight="highlight"
		line-numbers
	/>
	<div class="output">
		<h1>Output:</h1>
		<p>{{ output }}</p>
	</div>
</template>

<script>
import { MoLang } from 'molang'
import { PrismEditor } from 'vue-prism-editor'
import prism from 'prismjs'
import 'vue-prism-editor/dist/prismeditor.min.css'
import 'prismjs/themes/prism-tomorrow.css'

let molang

prism.languages.molang = {
	string: /(')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	'function-name': /\b(?!\d)(math|query|q)\.\w+/i,
	selector: /\b(?!\d)(variable|temp|context|v|t|c)\.\w+/i,
	boolean: /\b(?:true|false)\b/i,
	number: /(?:\b\d+(?:\.\d+)?(?:[ed][+-]\d+)?|&h[a-f\d]+)\b[%&!#]?/i,
	operator: /&&|\|\||[-+*/!<>]=?|[:?=]/i,
	keyword: /\b(return|loop|for_each|continue|break)\b/i,
	punctuation: /[.,;()[\]{}]/,
}

export default {
	data: () => ({
		startTimestamp: Date.now(),
		lastFrameTimestamp: Date.now(),
		code:
			localStorage.getItem('molang-code') ||
			'math.pow(query.anim_time, 2)',
		output: 0,
		shouldStopRefresh: false,
	}),
	mounted() {
		const currentTime = () => (Date.now() - this.startTimestamp) / 1000

		molang = new MoLang({
			'query.anim_time': currentTime,
			'query.delta_time': () => Date.now() - this.lastFrameTimestamp,
			'query.life_time': currentTime,
			'query.time': currentTime,
		})

		this.onChange()
		const refresh = () => {
			if (this.shouldStopRefresh) return

			this.onChange()
			requestAnimationFrame(refresh)
		}

		refresh()
	},
	unmounted() {
		this.shouldStopRefresh = true
	},
	components: {
		PrismEditor,
	},
	methods: {
		onChange() {
			this.lastFrameTimestamp = Date.now()
			localStorage.setItem('molang-code', this.code)

			try {
				this.output = molang.execute(this.code)
			} catch (err) {
				this.output = err.message
			}
		},
		highlight() {
			return prism.highlight(this.code, prism.languages.molang)
		},
	},
	watch: {
		code() {
			this.onChange()
		},
	},
}
</script>
