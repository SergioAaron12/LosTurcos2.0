function getInitialProducts() {
  const saved = localStorage.getItem('products');
  if (saved) {
    return JSON.parse(saved);
  }

  return [
    {id:5, name:"Alfombras Kilim pack 5 ud", price:285000, img:"https://picsum.photos/id/29/800/900", discount:18, category:"Textiles", stock:10},
    {id:6, name:"Toallas Hammam pack 20 ud", price:145000, img:"https://picsum.photos/id/160/800/900", discount:0, category:"Textiles", stock:10},
    {id:7, name:"Bata de Baño Turca", price:39000, img:"https://picsum.photos/id/1011/800/900", discount:5, category:"Textiles", stock:10},
    {id:8, name:"Jabón Alepo Natural caja 50 ud", price:95000, img:"https://picsum.photos/id/201/800/900", discount:0, category:"Aseo", stock:10},
    {id:9, name:"Jabón Líquido Perfumado caja 12 ud", price:35000, img:"https://picsum.photos/id/405/800/900", discount:0, category:"Aseo", stock:10},
    {id:10, name:"Pasta Dental Premium pack 24 ud", price:45000, img:"https://picsum.photos/id/455/800/900", discount:5, category:"Aseo", stock:10},
    {id:11, name:"Champú Natural Turco pack 10 ud", price:48000, img:"https://picsum.photos/id/420/800/900", discount:8, category:"Cuidado Capilar", stock:10},
    {id:12, name:"Acondicionador Herbal pack 10 ud", price:52000, img:"https://picsum.photos/id/1025/800/900", discount:0, category:"Cuidado Capilar", stock:10},
    {id:13, name:"Crema Corporal Humectante caja 24 ud", price:52000, img:"https://picsum.photos/id/435/800/900", discount:0, category:"Cuidado Adulto", stock:10},
    {id:14, name:"Desodorante Spray pack 12 ud", price:38000, img:"https://picsum.photos/id/445/800/900", discount:0, category:"Cuidado Adulto", stock:10},
    {id:15, name:"Loción Corporal Aromática caja 10 ud", price:62000, img:"https://picsum.photos/id/465/800/900", discount:0, category:"Cuidado Adulto", stock:10}
  ];
}

function showAdminPanel() {
  document.getElementById('admin-auth').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
}

function showAdminLogin() {
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('admin-auth').classList.remove('hidden');
}

// Sincronizar products con localStorage
function syncProductsFromStorage() {
  const saved = localStorage.getItem('products');
  products = saved ? JSON.parse(saved) : getInitialProducts();
}
// admin.js - Lógica de administración independiente

let products = getInitialProducts();

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

function checkAdminPassword() {
  const pass = document.getElementById('admin-password').value;
  if (pass === 'Brujit@31$') {
    sessionStorage.setItem('adminAuthenticated', 'true');
    document.getElementById('admin-auth-error').classList.add('hidden');
    showAdminPanel();
    renderAdminProducts();
  } else {
    document.getElementById('admin-auth-error').classList.remove('hidden');
  }
}

function renderAdminProducts() {
  syncProductsFromStorage();
  const grid = document.getElementById('admin-products-grid');
  grid.innerHTML = '';
  if (products.length === 0) {
    grid.innerHTML = '<p class="text-gray-400 text-center">No hay productos.</p>';
    return;
  }
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'border p-3 rounded mb-2 flex items-center gap-3 bg-white shadow';
    card.innerHTML = `
      <img src="${p.img}" class="w-16 h-16 object-cover rounded"/>
      <div class="flex-1">
        <div class="font-bold">${p.name}</div>
        <div>Stock: <span>${p.stock || 0}</span></div>
        <div>Precio: $${p.price.toLocaleString('es-CL')}</div>
        <div>Categoría: ${p.category || ''}</div>
        <div>Descuento: ${p.discount || 0}%</div>
      </div>
      <button onclick="editProduct(${p.id})" class="px-2 py-1 bg-blue-500 text-white rounded">Editar</button>
      <button onclick="deleteProduct(${p.id})" class="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
    `;
    grid.appendChild(card);
  });
}

function resetForm() {
  document.getElementById('product-id').value = '';
  document.getElementById('product-name').value = '';
  document.getElementById('product-price').value = '';
  document.getElementById('product-stock').value = '';
  document.getElementById('product-category').value = '';
  document.getElementById('product-discount').value = '';
  document.getElementById('product-img').value = '';
  document.getElementById('product-details').value = '';
  document.getElementById('product-img-file').value = '';
  if(document.getElementById('product-showcase')) document.getElementById('product-showcase').value = 'index';
}

function editProduct(id) {
  const prod = products.find(p => p.id === id);
  document.getElementById('product-id').value = prod.id;
  document.getElementById('product-name').value = prod.name;
  document.getElementById('product-price').value = prod.price;
  document.getElementById('product-stock').value = prod.stock || 0;
  document.getElementById('product-category').value = prod.category || '';
  document.getElementById('product-discount').value = prod.discount || 0;
  document.getElementById('product-img').value = prod.img;
  document.getElementById('product-details').value = prod.details || '';
  document.getElementById('product-img-file').value = '';
  if(document.getElementById('product-showcase')) document.getElementById('product-showcase').value = prod.showcase || 'index';
}

function deleteProduct(id) {
  if (confirm('¿Seguro que deseas eliminar este producto?')) {
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
      products.splice(idx, 1);
      saveProducts();
      renderAdminProducts();
      resetForm();
    }
  }
}

document.getElementById('product-form').onsubmit = function(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value;
  const price = parseInt(document.getElementById('product-price').value);
  const stock = parseInt(document.getElementById('product-stock').value);
  const category = document.getElementById('product-category').value;
  const discount = parseInt(document.getElementById('product-discount').value) || 0;
  const details = document.getElementById('product-details').value;
  let img = document.getElementById('product-img').value;
  const imgFile = document.getElementById('product-img-file').files[0];
  const showcase = document.getElementById('product-showcase') ? document.getElementById('product-showcase').value : 'index';
  if (imgFile) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      img = ev.target.result;
      saveProductData();
    };
    reader.readAsDataURL(imgFile);
  } else {
    saveProductData();
  }
  function saveProductData() {
    if (id) {
      // Editar
      const idx = products.findIndex(p => p.id == id);
      if (idx > -1) {
        products[idx] = { ...products[idx], name, price, stock, category, discount, img, details, showcase };
      }
    } else {
      // Nuevo
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      products.push({ id: newId, name, price, stock, category, discount, img, details, showcase });
    }
    saveProducts();
    showAdminPanel();
    renderAdminProducts();
    resetForm();
  }
};

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.removeItem('adminAuthenticated');
    showAdminLogin();
  });

  if (sessionStorage.getItem('adminAuthenticated') === 'true') {
    showAdminPanel();
    renderAdminProducts();
    return;
  }

  showAdminLogin();
});
