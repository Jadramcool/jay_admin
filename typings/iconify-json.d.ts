// @iconify-json/* 包的 icons.json 是 1~3MB 的原生 JSON：
// resolveJsonModule 开启时 TS 会按文件推导巨型字面类型，拖垮 vue-tsc；
// 但本声明在部分 TS 环境（如 IDE 内置服务）下会被 JSON 文件解析优先级覆盖而失效，
// 因此消费处（register-icons.ts）另有 `as IconifyJSON` 断言兜底，两套机制各保一边。
declare module '@iconify-json/*/icons.json' {
  const collection: import('@iconify/vue').IconifyJSON
  export default collection
}
