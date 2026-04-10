// Funciones principales JS para la tienda
// Incluye: buscador, renderizado de productos, carrito, filtros, etc.

// ...código JS extraído de inicio3.html...
// Buscador de productos
function buscarProductos() {
  const query = document.getElementById('buscador').value.trim().toLowerCase();
  if (!query) {
    renderProducts('products-grid');
    return;
  }
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';
  const resultados = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  if (resultados.length === 0) {
    grid.innerHTML = '<p class="text-center text-gray-500 py-10">No se encontraron productos para tu búsqueda.</p>';
    return;
  }
  resultados.forEach(p => {
    const badge = p.discount ? 
      `<span class="absolute top-3 right-3 bg-pomegranate text-white text-xs font-bold px-3 py-1 rounded-full shadow lux-frame">-${p.discount}%</span>` : '';
    const card = document.createElement('div');
    card.className = 'product-card relative';
    card.innerHTML = `
      <img src="${p.img}" class="w-full h-60 object-cover" alt="${p.name}">
      ${badge}
      <div class="p-5">
        <h3 class="text-lg ornate-serif font-semibold mb-2 text-gold-lux">${p.name}</h3>
        <div class="text-xl font-bold text-turquoise-jewel mb-3">$${p.price.toLocaleString('es-CL')}</div>
        <button onclick="addToCart(${p.id})" class="w-full py-3 bg-gold-lux/10 hover:bg-gold-lux/25 text-gold-lux border border-gold-lux/30 rounded-lg font-medium transition text-sm">
          + Agregar
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}
const products = [
  // Alimentos
  {id:1, name:"Baklava Pistacho Premium 5 kg", price:89000, img:"https://picsum.photos/id/312/800/900", discount:15, category:"Alimentos"},
  {id:2, name:"Café Turco Molido 10 kg", price:65000, img:"https://picsum.photos/id/1060/800/900", discount:0, category:"Alimentos"},
  {id:3, name:"Té Negro Rize Turco 10 kg", price:58000, img:"https://picsum.photos/id/870/800/900", discount:0, category:"Alimentos"},
  {id:4, name:"Lokum Surtido 5 kg caja", price:72000, img:"https://picsum.photos/id/1080/800/900", discount:10, category:"Alimentos"},
  // Textiles
  {id:5, name:"Alfombras Kilim pack 5 ud", price:285000, img:"https://picsum.photos/id/29/800/900", discount:18, category:"Textiles"},
  {id:6, name:"Toallas Hammam pack 20 ud", price:145000, img:"https://picsum.photos/id/160/800/900", discount:0, category:"Textiles"},
  {id:7, name:"Bata de Baño Turca", price:39000, img:"https://picsum.photos/id/1011/800/900", discount:5, category:"Textiles"},
  // Aseo
  {id:8, name:"Jabón Alepo Natural caja 50 ud", price:95000, img:"https://picsum.photos/id/201/800/900", discount:0, category:"Aseo"},
  {id:9, name:"Jabón Líquido Perfumado caja 12 ud", price:35000, img:"https://picsum.photos/id/405/800/900", discount:0, category:"Aseo"},
  {id:10, name:"Pasta Dental Premium pack 24 ud", price:45000, img:"https://picsum.photos/id/455/800/900", discount:5, category:"Aseo"},
  // Cuidado Capilar
  {id:11, name:"Champú Natural Turco pack 10 ud", price:48000, img:"https://picsum.photos/id/420/800/900", discount:8, category:"Cuidado Capilar"},
  {id:12, name:"Acondicionador Herbal pack 10 ud", price:52000, img:"https://picsum.photos/id/1025/800/900", discount:0, category:"Cuidado Capilar"},
  // Cuidado Adulto
  {id:13, name:"Crema Corporal Humectante caja 24 ud", price:52000, img:"https://picsum.photos/id/435/800/900", discount:0, category:"Cuidado Adulto"},
  {id:14, name:"Desodorante Spray pack 12 ud", price:38000, img:"https://picsum.photos/id/445/800/900", discount:0, category:"Cuidado Adulto"},
  {id:15, name:"Loción Corporal Aromática caja 10 ud", price:62000, img:"https://picsum.photos/id/465/800/900", discount:0, category:"Cuidado Adulto"},
];

let cart = [];
let selectedCategory = 'Todos';

function filterByCategory(category) {
  selectedCategory = category;
  renderProducts('products-grid');
}

function renderProducts(containerId, onlyDiscount = false) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';
  let filtered = onlyDiscount ? products.filter(p => p.discount > 0) : products;
  
  if (selectedCategory !== 'Todos') {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }

  filtered.forEach(p => {
    const badge = p.discount ? 
      `<span class="absolute top-3 right-3 bg-pomegranate text-white text-xs font-bold px-3 py-1 rounded-full shadow lux-frame">-${p.discount}%</span>` : '';

    const card = document.createElement('div');
    card.className = 'product-card relative';
    card.innerHTML = `
      <img src="${p.img}" class="w-full h-60 object-cover" alt="${p.name}">
      ${badge}
      <div class="p-5">
        <h3 class="text-lg ornate-serif font-semibold mb-2 text-gold-lux">${p.name}</h3>
        <div class="text-xl font-bold text-turquoise-jewel mb-3">$${p.price.toLocaleString('es-CL')}</div>
        <button onclick="addToCart(${p.id})" class="w-full py-3 bg-gold-lux/10 hover:bg-gold-lux/25 text-gold-lux border border-gold-lux/30 rounded-lg font-medium transition text-sm">
          + Agregar
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  const exist = cart.find(i => i.id === id);
  if (exist) exist.quantity++;
  else cart.push({...prod, quantity: 1});
  document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

function renderCart() {
  const container = document.getElementById('cart-items');
  container.innerHTML = cart.length === 0 ? '<p class="text-center py-10 text-gray-500 text-sm">Tu carrito está vacío</p>' : '';

  let total = 0;
  cart.forEach(item => {
    const subt = item.price * item.quantity;
    total += subt;
    container.innerHTML += `
      <div class="flex gap-4 items-center border-b pb-3">
        <img src="${item.img}" class="w-16 h-16 object-cover rounded-md">
        <div class="flex-1">
          <div class="text-sm font-medium">${item.name}</div>
          <div class="text-xs text-gray-600">$${item.price.toLocaleString('es-CL')} × ${item.quantity}</div>
        </div>
        <div class="text-right text-sm font-semibold">$${subt.toLocaleString('es-CL')}</div>
      </div>
    `;
  });
  document.getElementById('cart-total').textContent = `$${total.toLocaleString('es-CL')}`;
}

function toggleCart() {
  const modal = document.getElementById('cart-modal');
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) renderCart();
}

function checkout() {
  alert('¡Cotización enviada! Te contactaremos pronto.');
  cart = [];
  document.getElementById('cart-count').textContent = '0';
  toggleCart();
}

// Inicializar
renderProducts('recomendados-grid', false);
renderProducts('products-grid');
renderProducts('offers-grid', true);

document.getElementById('cart-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) toggleCart();
});
// Buscador de productos
function buscarProductos() {
  const query = document.getElementById('buscador').value.trim().toLowerCase();
  if (!query) {
    renderProducts('products-grid');
    return;
  }
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';
  const resultados = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  if (resultados.length === 0) {
    grid.innerHTML = '<p class="text-center text-gray-500 py-10">No se encontraron productos para tu búsqueda.</p>';
    return;
  }
  resultados.forEach(p => {
    const badge = p.discount ? 
      `<span class="absolute top-3 right-3 bg-pomegranate text-white text-xs font-bold px-3 py-1 rounded-full shadow lux-frame">-${p.discount}%</span>` : '';
    const card = document.createElement('div');
    card.className = 'product-card relative';
    card.innerHTML = `
      <img src="${p.img}" class="w-full h-60 object-cover" alt="${p.name}">
      ${badge}
      <div class="p-5">
        <h3 class="text-lg ornate-serif font-semibold mb-2 text-gold-lux">${p.name}</h3>
        <div class="text-xl font-bold text-turquoise-jewel mb-3">$${p.price.toLocaleString('es-CL')}</div>
        <button onclick="addToCart(${p.id})" class="w-full py-3 bg-gold-lux/10 hover:bg-gold-lux/25 text-gold-lux border border-gold-lux/30 rounded-lg font-medium transition text-sm">
          + Agregar
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ...agrega aquí el resto de funciones JS de inicio3.html...
