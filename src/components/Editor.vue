<template>
	<PrismEditor
		class="molang-editor w-2/3"
		:modelValue="modelValue"
		@update:modelValue="emit('update:modelValue', $event)"
		:highlight="highlight"
		line-numbers
	/>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import 'vue-prism-editor/dist/prismeditor.min.css'
import prism from 'prismjs'
import { PrismEditor } from 'vue-prism-editor'

/**
 * Original highlighter by JannisX11 (https://github.com/JannisX11/MolangJS)
 * Modified to fit our needs
 */
prism.languages.molang = {
	string: /(')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	'function-name': /\b(?!\d)(math|query|q)\./i,
	selector: /\b(?!\d)(variable|temp|context|v|t|c)\./i,
	boolean: /\b(?:true|false)\b/i,
	number: /(?:\b\d+(?:\.\d+)?(?:[ed][+-]\d+)?|&h[a-f\d]+)\b[%&!#]?/i,
	operator: /&&|\|\||[-+*/!<>]=?|[:?=]/i,
	keyword: /\b(return|loop|for_each|continue|break)\b/i,
	punctuation: /[.,;()[\]{}]/,
}

const props = defineProps<{ modelValue: string }>()
const emit = defineEmit(['update:modelValue'])

function highlight() {
	return prism.highlight(props.modelValue, prism.languages.molang)
}
</script>
