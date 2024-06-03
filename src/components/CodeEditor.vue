<script setup lang="ts">
import CodeFlask from 'codeflask';
import { onMounted, ref } from 'vue';


const prismGrammar = {
  comment: {
    pattern: /\/\/.*/,
    greedy: true,
  },
  function: /([a-z_][a-z0-9_]+)(?=\()/,
  keyword:
    /\b(use|case|if|@external|@deprecated|fn|import|let|assert|try|pub|type|opaque|const|panic|todo|as)\b/,
  symbol: {
    pattern: /([A-Z][A-Za-z0-9_]+)/,
    greedy: true,
  },
  operator: {
    pattern:
      /(<<|>>|<-|->|\|>|<>|\.\.|<=\.?|>=\.?|==\.?|!=\.?|<\.?|>\.?|&&|\|\||\+\.?|-\.?|\/\.?|\*\.?|%\.?|=)/,
    greedy: true,
  },
  string: {
    pattern: /"((?:[^"\\]|\\.)*)"/,
    greedy: true,
  },
  module: {
    pattern: /([a-z][a-z0-9_]*)\./,
    inside: {
      punctuation: /\./,
    },
    alias: "keyword",
  },
  punctuation: /[.\\:,{}()]/,
  number:
    /\b(?:0b[0-1]+|0o[0-7]+|[[:digit:]][[:digit:]_]*(\\.[[:digit:]]*)?|0x[[:xdigit:]]+)\b/,
};

let output;
let initialCode;
const editor = ref()


const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const clearOutput = () => {
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }
}

const appendOutput = (content, className) => {
  if (!content) return;
  const element = document.createElement("pre");
  element.textContent = content;
  element.className = className;
  output.appendChild(element);
}

// Whether the worker is currently working or not, used to avoid sending
// multiple messages to the worker at once.
// This will be true when the worker is compiling and executing the code, but
// this first time it is as the worker is initialising.
let workerWorking = true;
let queuedWork = undefined;
const worker = new Worker("../worker.js", { type: "module" });

const sendToWorker = (code) => {
  if (workerWorking) {
    queuedWork = code;
    return;
  }
  workerWorking = true;
  worker.postMessage(code);
}

worker.onmessage = (event) => {
  const result = event.data;
  clearOutput();
  if (result.log) appendOutput(result.log, "log");
  if (result.error) appendOutput(result.error, "error");
  for (const warning of result.warnings || []) {
    appendOutput(warning, "warning");
  }

  // Deal with any queued work
  workerWorking = false;
  if (queuedWork) sendToWorker(queuedWork);
  queuedWork = undefined;
};


onMounted(() => {

  output = document.querySelector("#output");
  initialCode = document.querySelector("#code").innerHTML;
  editor.value = new CodeFlask('#editor-target', {
    language: 'gleam',
    defaultTheme: false,
  });

  editor.value.addLanguage("gleam", prismGrammar);
  editor.value.updateCode(initialCode);
  editor.value.onUpdate(debounce((code) => sendToWorker(code), 200));
});


</script>
<template>
  <div class="grid grid-cols-2 flex-1 overflow-hidden">
    <section id="editor" class="bg-[#282c34] p-4 border-r border-gleam">
      <div id="editor-target"></div>
    </section>
    <aside id="output" class="p-4"></aside>
  </div>
</template>
