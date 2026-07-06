<script setup>
const appName = '次元绘境'
void appName
</script>

<style>
page {
  min-height: 100%;
  background: #030712;
  color: #f8fbff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button {
  cursor: pointer;
  font: inherit;
  transition: transform 120ms ease, filter 120ms ease, opacity 120ms ease;
}

button:not([disabled]):hover {
  filter: brightness(1.08);
}

button:not([disabled]):active {
  transform: scale(0.96);
  filter: brightness(1.16);
}

button[disabled] {
  cursor: not-allowed;
  opacity: 0.64;
}
</style>
