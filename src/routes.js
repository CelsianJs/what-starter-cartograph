import AppShell from './components/AppShell.jsx';
import Build from './pages/Build.jsx';
import Cart from './pages/Cart.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Products from './pages/Products.jsx';
import Receipt from './pages/Receipt.jsx';

const shell = (path, component) => ({ path, component, layout: AppShell });

export const routes = [
  shell('/', Home),
  shell('/products', Products),
  shell('/products/:slug', ProductDetail),
  shell('/cart', Cart),
  shell('/receipt', Receipt),
  shell('/build', Build),
  shell('/404', NotFound),
  shell('/*', NotFound),
];
