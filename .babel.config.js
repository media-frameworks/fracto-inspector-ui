export default {
  sourceType: "module",
  presets: [
    ["env"],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ],
};