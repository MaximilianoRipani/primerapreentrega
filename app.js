// Ejemplo de uso de las rutas:
// http://localhost:8000 = Home, te voy a mostrar un mensajito
// http://localhost:8000/products = Te muestro el json de todos los productos
// http://localhost:8000/products?limit=1 = Te mustro solo el primer producto
// http://localhost:8000products/1 = Te muestro solo el producto con id 1 (o el id que le pongas)
import express from 'express';
import ProductManager from './ProductManager.js';
import CartManager from './CartManager.js'; // Importa el gestor de carritos

const app = express();
const port = 8000;

const productManager = new ProductManager('productos.json');
const cartManager = new CartManager('carrito.json'); // Crea una instancia del gestor de carritos

app.use(express.json());

// Rutas para los productos
const productRouter = express.Router();

productRouter.get('/', (req, res) => {
  const limit = req.query.limit;
  let products = productManager.getProducts();

  if (limit) {
    products = products.slice(0, parseInt(limit));
  }

  res.json({ products });
});

productRouter.get('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  const product = productManager.getProductById(productId);

  if (product) {
    res.json({ product });
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

productRouter.post('/', (req, res) => {
  const newProduct = req.body;
  try {
    const addedProduct = productManager.addProduct(newProduct);
    res.json(addedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productRouter.put('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  const updatedFields = req.body;
  try {
    const updatedProduct = productManager.updateProduct(productId, updatedFields);
    res.json(updatedProduct);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

productRouter.delete('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  try {
    productManager.deleteProduct(productId);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.use('/api/products', productRouter);

// Rutas para los carritos
const cartRouter = express.Router();

cartRouter.post('/', (req, res) => {
  try {
    const newCart = cartManager.createCart();
    res.json(newCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

cartRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  const cart = cartManager.getCartById(cartId);

  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

cartRouter.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = parseInt(req.params.pid);
  const quantity = parseInt(req.body.quantity || 1); // Si no se especifica la cantidad, se agrega 1 por defecto
  try {
    cartManager.addProductToCart(cartId, productId, quantity);
    res.json({ message: 'Producto agregado al carrito correctamente' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.use('/api/carts', cartRouter);

app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
