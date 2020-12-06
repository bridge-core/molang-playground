<template>
	<PrismEditor
		class="molang-editor"
		v-model="code"
		:highlight="highlight"
		line-numbers
	/>
	<div class="options">
		<button @click="toggleShouldLoop">
			Execution: {{ executionMode }}
		</button>
		<button v-if="executionMode === 'Manual'" @click="execute">
			Execute
		</button>
		<button @click="copyCode">Copy Code</button>
		<button @click="clearCode">Clear Code</button>
		<button @click="resetTime">Reset Time</button>
		<button @click="clearConsole">Clear Console</button>
	</div>
	<div class="output-row" style="display: flex">
		<div class="molang-output">
			<h1>Output:</h1>
			<p :style="{ color: isOutputError ? '#d62828' : 'unset' }">
				{{ output }}
			</p>
		</div>
		<div class="console-output">
			<h1>Console:</h1>
			<p v-if="consoleOutput.length === 0">[EMPTY]</p>
			<ul v-else>
				<li v-for="(text, i) in consoleOutput" :key="i">{{ text }}</li>
			</ul>
		</div>
	</div>
</template>

<script>
import { MoLang } from 'molang'
import 'vue-prism-editor/dist/prismeditor.min.css'
import prism from 'prismjs'
import { PrismEditor } from 'vue-prism-editor'

import 'prismjs/themes/prism-tomorrow.css'

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

let molang

export default {
	data: () => ({
		startTimestamp: Date.now(),
		lastFrameTimestamp: Date.now(),
		code:
			localStorage.getItem('molang-code') ||
			'math.pow(math.round(query.anim_time), 2)',
		output: 0,
		isOutputError: false,
		consoleOutput: [],
		shouldStopRefresh: false,
		executionMode:
			localStorage.getItem('molang-execution-mode') || 'Manual',
	}),
	mounted() {
		const currentTime = () => (Date.now() - this.startTimestamp) / 1000
		const log = (logVal) => {
			this.consoleOutput.push(logVal)
			return logVal
		}
		molang = new MoLang({
			'query.anim_time': currentTime,
			'query.delta_time': () => Date.now() - this.lastFrameTimestamp,
			'query.life_time': currentTime,
			'query.time': currentTime,
			'query.log': log,
			'query.debug_output': log,
		})

		this.onChange()
		const refresh = () => {
			if (this.shouldStopRefresh) return

			if (this.executionMode === 'Loop') this.execute()
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
			localStorage.setItem('molang-code', this.code)

			if (this.executionMode === 'On Change') this.execute()
		},
		execute() {
			try {
				this.output = molang.execute(this.code)
				this.isOutputError = false
			} catch (err) {
				this.output = err.message
				this.isOutputError = true
			}

			this.lastFrameTimestamp = Date.now()
		},
		highlight() {
			return prism.highlight(this.code, prism.languages.molang)
		},
		resetTime() {
			this.startTimestamp = Date.now()
			this.lastFrameTimestamp = Date.now()
		},
		copyCode() {
			navigator.clipboard.writeText(this.code.replace('\n', ' '))
		},
		clearCode() {
			if (
				window.confirm(
					'Are you sure that you want to clear the MoLang code?'
				)
			) {
				this.resetTime()
				this.code = ''
			}
		},
		clearConsole() {
			this.consoleOutput = []
		},
		toggleShouldLoop() {
			if (this.executionMode === 'Loop') this.executionMode = 'On Change'
			else if (this.executionMode === 'On Change')
				this.executionMode = 'Manual'
			else if (this.executionMode === 'Manual')
				this.executionMode = 'Loop'

			localStorage.setItem('molang-execution-mode', this.executionMode)
		},
	},
	watch: {
		code() {
			this.onChange()
		},
	},
}
</script>
