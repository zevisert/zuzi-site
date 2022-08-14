// index.d.ts

declare module '*.svg' {
  // Imported by @svgr/webpack
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
