import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main:         path.resolve(__dirname, 'index.html'),
        home:         path.resolve(__dirname, 'features/home/index.html'),
        map:          path.resolve(__dirname, 'features/map/index.html'),
        map3d:        path.resolve(__dirname, 'features/map/3Dmap.html'),
        search:       path.resolve(__dirname, 'features/search/search.html'),
        navigation:   path.resolve(__dirname, 'features/navigation/navigation.html'),
        notification: path.resolve(__dirname, 'features/notification/notification.html'),
        event:        path.resolve(__dirname, 'features/event/event.html'),
        admin:        path.resolve(__dirname, 'features/admin/admin.html'),
      },
    },
  },
});
