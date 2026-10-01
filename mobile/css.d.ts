// TypeScript 6 checks side-effect imports such as `import './global.css'`.
// NativeWind's types only add `className` to components and don't declare
// CSS files, so declare them here.
declare module '*.css';
