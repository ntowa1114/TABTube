/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 1. appディレクトリ内のすべてのファイル
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // 2. もし components フォルダなどを作っている場合
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // 3. もし src フォルダを使っている場合
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};