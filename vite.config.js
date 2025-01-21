import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';

// 复制文件到 dist 目录的插件
const copyManifestPlugin = () => ({
  name: 'copy-manifest',
  closeBundle: () => {
    // 复制 manifest.json
    copyFileSync('manifest.json', 'dist/manifest.json');
    
    // 创建 icons 目录
    mkdirSync('dist/assets/icons', { recursive: true });
    
    // 创建临时图标（后续需要替换为实际图标）
    const iconSizes = [16, 48, 128];
    iconSizes.forEach(size => {
      const iconPath = `dist/assets/icons/icon${size}.png`;
      // 如果图标不存在，创建一个空的图标文件
      if (!existsSync(iconPath)) {
        writeFileSync(iconPath, '');
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        background: resolve(__dirname, 'src/background/background.js'),
        content: resolve(__dirname, 'src/content/content.js')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
