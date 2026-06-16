import './style.css';
import { renderHome } from './pages/home';

const app = document.getElementById('app');
if (!app) throw new Error('#app element not found');

renderHome(app);
