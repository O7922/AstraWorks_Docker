import './style.css';
import { renderSearch } from './pages/search';

const app = document.getElementById('app');
if (!app) throw new Error('#app element not found');

renderSearch(app);
