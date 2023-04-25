import 'chrome-types'

declare module '*.module.css' {
  const css: any;
  export default css;
}

declare module '*.module.less' {
  const less: any;
  export default less;
}
