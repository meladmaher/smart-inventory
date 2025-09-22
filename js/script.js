
        // Data Storage and Management
        const App = {
            currentChart: null, // To store the current chart instance
            
            init() {
                // Initialize data if not present
                if (!localStorage.getItem('products')) {
                    localStorage.setItem('products', JSON.stringify([
                        { id: 1, name: 'لابتوب', code: 'LP001', category: 'إلكترونيات', quantity: 15, price: 899.99 },
                        { id: 2, name: 'هاتف ذكي', code: 'SP002', category: 'إلكترونيات', quantity: 25, price: 599.99 },
                        { id: 3, name: 'سماعات', code: 'HP003', category: 'ملحقات', quantity: 40, price: 99.99 },
                        { id: 4, name: 'لوحة مفاتيح', code: 'KB004', category: 'ملحقات', quantity: 3, price: 49.99 },
                        { id: 5, name: 'ماوس', code: 'MS005', category: 'ملحقات', quantity: 0, price: 29.99 }
                    ]));
                }
                
                if (!localStorage.getItem('customers')) {
                    localStorage.setItem('customers', JSON.stringify([
                        { id: 1, name: 'محمد أحمد', phone: '01012345678', email: '', address: '', totalPurchases: 0, purchaseCount: 0 },
                        { id: 2, name: 'أحمد علي', phone: '01087654321', email: '', address: '', totalPurchases: 0, purchaseCount: 0 }
                    ]));
                }
                
                if (!localStorage.getItem('sales')) {
                    localStorage.setItem('sales', JSON.stringify([]));
                }
                
                if (!localStorage.getItem('returns')) {
                    localStorage.setItem('returns', JSON.stringify([]));
                }
                
                if (!localStorage.getItem('settings')) {
                    localStorage.setItem('settings', JSON.stringify({
                        lowStockThreshold: 5,
                        currency: 'ج.م',
                        darkMode: false
                    }));
                }
                
                // Set current date
                const now = new Date();
                document.getElementById('currentDate').textContent = now.toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                // Initialize UI
                this.setupEventListeners();
                this.loadDashboard();
                this.renderProducts();
                this.setupNavigation();
                
                // Set dark mode if enabled
                const settings = JSON.parse(localStorage.getItem('settings'));
                if (settings.darkMode) {
                    document.documentElement.classList.add('dark');
                }
                
                // Open sales page by default
                this.showPage('sales');
            },
            
            setupEventListeners() {
                // Navigation
                document.querySelectorAll('.sidebar-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        const target = item.getAttribute('href');
                        this.showPage(target.substring(1));
                    });
                });
                
                // Dark mode toggle
                document.getElementById('darkModeToggle').addEventListener('click', () => {
                    document.documentElement.classList.toggle('dark');
                    const settings = JSON.parse(localStorage.getItem('settings'));
                    settings.darkMode = document.documentElement.classList.contains('dark');
                    localStorage.setItem('settings', JSON.stringify(settings));
                });
                
                // Product management
                document.getElementById('addProductBtn').addEventListener('click', () => this.showProductModal());
                document.getElementById('saveProductBtn').addEventListener('click', () => this.saveProduct());
                document.getElementById('cancelProductBtn').addEventListener('click', () => this.closeProductModal());
                
                // Customer management
                document.getElementById('addCustomerBtn').addEventListener('click', () => this.showCustomerModal());
                document.getElementById('saveCustomerBtn').addEventListener('click', () => this.saveCustomer());
                document.getElementById('cancelCustomerBtn').addEventListener('click', () => this.closeCustomerModal());
                
                // Sales
                document.getElementById('productSelect').addEventListener('change', (e) => this.updateProductInfo(e.target.value));
                document.getElementById('addToCartBtn').addEventListener('click', () => this.addToCart());
                document.getElementById('completeSaleBtn').addEventListener('click', () => this.completeSale(true));
                document.getElementById('confirmSaleBtn').addEventListener('click', () => this.completeSale(false));
                
                // Returns
                document.getElementById('returnProductSelect').addEventListener('change', (e) => this.updateReturnProductInfo(e.target.value));
                document.getElementById('returnQty').addEventListener('input', () => this.updateReturnPrice());
                document.getElementById('returnReason').addEventListener('change', (e) => {
                    if (e.target.value === 'آخر') {
                        document.getElementById('otherReasonContainer').classList.remove('hidden');
                    } else {
                        document.getElementById('otherReasonContainer').classList.add('hidden');
                    }
                });
                document.getElementById('confirmReturnBtn').addEventListener('click', () => this.processReturn());
                document.getElementById('cancelReturnBtn').addEventListener('click', () => this.closeReturnModal());
                
                // Settings
                document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
                
                // Modals
                document.getElementById('confirmCancel').addEventListener('click', () => this.closeConfirmModal());
                document.getElementById('closeInvoiceBtn').addEventListener('click', () => this.closeInvoiceModal());
                document.getElementById('printInvoiceBtn').addEventListener('click', () => window.print());
                
                // Backup and restore
                document.getElementById('backupBtn').addEventListener('click', () => this.backupData());
                document.getElementById('restoreBtn').addEventListener('click', () => document.getElementById('restoreFileInput').click());
                
                // Export all invoices
                document.getElementById('exportAllInvoicesBtn').addEventListener('click', () => this.exportAllInvoices());
                
                // Show returns only checkbox
                document.getElementById('showReturnsOnly').addEventListener('change', () => this.renderInvoices());
                
                // Create a hidden file input for restore
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.id = 'restoreFileInput';
                fileInput.accept = '.json';
                fileInput.style.display = 'none';
                fileInput.addEventListener('change', (e) => this.restoreData(e));
                document.body.appendChild(fileInput);
            },
            
            showPage(pageId) {
                // Hide all pages
                document.querySelectorAll('.page-section').forEach(section => {
                    if (section) section.classList.add('hidden');
                });
                
                // Show selected page
                const pageSection = document.getElementById(pageId);
                if (pageSection) {
                    pageSection.classList.remove('hidden');
                } else {
                    console.error(`Page with ID '${pageId}' not found`);
                    return;
                }
                
                // Update active nav item
                document.querySelectorAll('.sidebar-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                const activeItem = document.querySelector(`.sidebar-item[href="#${pageId}"]`);
                if (activeItem) activeItem.classList.add('active');
                
                // Load page-specific data
                if (pageId === 'dashboard') {
                    this.loadDashboard();
                } else if (pageId === 'products') {
                    this.renderProducts();
                } else if (pageId === 'sales') {
                    this.setupSalesPage();
                } else if (pageId === 'invoices') {
                    this.renderInvoices();
                } else if (pageId === 'returns') {
                    this.renderReturns();
                } else if (pageId === 'customers') {
                    this.renderCustomers();
                } else if (pageId === 'reports') {
                    this.renderReports();
                } else if (pageId === 'settings') {
                    this.loadSettings();
                }
            },
            
            setupNavigation() {
                // Handle initial hash if present
                if (window.location.hash) {
                    const pageId = window.location.hash.substring(1);
                    if (document.getElementById(pageId)) {
                        this.showPage(pageId);
                    }
                }
            },
            
            loadDashboard() {
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const returns = JSON.parse(localStorage.getItem('returns') || '[]');
                const settings = JSON.parse(localStorage.getItem('settings'));
                
                // Calculate net sales (sales minus returns)
                const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
                const totalReturns = returns.reduce((sum, ret) => sum + ret.amount, 0);
                const netSales = totalSales - totalReturns;
                
                // Update stats
                document.getElementById('totalProducts').textContent = products.length;
                document.getElementById('totalSalesValue').textContent = `${settings.currency || 'ج.م'} ${netSales.toFixed(2)}`;
                
                const lowStockCount = products.filter(p => p.quantity <= settings.lowStockThreshold && p.quantity > 0).length;
                document.getElementById('lowStockCount').textContent = lowStockCount;
                
                const outOfStockCount = products.filter(p => p.quantity === 0).length;
                document.getElementById('outOfStockCount').textContent = outOfStockCount;
                
                // Update recent sales table
                const recentSalesHtml = sales.slice(-5).reverse().map(sale => `
                    <tr>
                        <td class="py-2 px-3">${new Date(sale.date).toLocaleDateString('ar-EG')}</td>
                        <td class="py-2 px-3">${sale.customerName || 'عميل بدون اسم'}</td>
                        <td class="py-2 px-3 text-left">${settings.currency || 'ج.م'} ${sale.totalAmount.toFixed(2)}</td>
                    </tr>
                `).join('');
                document.getElementById('recentSalesTable').innerHTML = recentSalesHtml || '<tr><td colspan="3" class="py-4 text-center text-gray-500">لا توجد مبيعات حديثة</td></tr>';
                
                // Update low stock items
                const lowStockItems = products.filter(p => p.quantity <= settings.lowStockThreshold && p.quantity > 0);
                const lowStockHtml = lowStockItems.map(item => `
                    <div class="p-3 border border-warning rounded-lg bg-warning bg-opacity-10">
                        <div class="font-medium">${item.name}</div>
                        <div class="text-sm text-warning">المتبقي: ${item.quantity} فقط</div>
                    </div>
                `).join('');
                document.getElementById('lowStockItems').innerHTML = lowStockHtml || '<div class="text-gray-500 text-center py-4">لا توجد منتجات قليلة المخزون</div>';
                
                // Render stock distribution chart
                this.renderStockChart(products);
            },
            
            renderStockChart(products) {
                const ctx = document.getElementById('stockChart');
                if (!ctx) return;
                
                // Destroy previous chart if exists
                if (this.currentChart) {
                    this.currentChart.destroy();
                }
                
                // Group products by category
                const categories = {};
                products.forEach(product => {
                    if (!categories[product.category]) {
                        categories[product.category] = 0;
                    }
                    categories[product.category] += product.quantity;
                });
                
                const categoryNames = Object.keys(categories);
                const categoryCounts = Object.values(categories);
                
                // Use Chart.js to render the chart
                this.currentChart = new Chart(ctx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: categoryNames,
                        datasets: [{
                            label: 'كمية المخزون',
                            data: categoryCounts,
                            backgroundColor: [
                                'rgba(79, 70, 229, 0.7)',
                                'rgba(16, 185, 129, 0.7)',
                                'rgba(245, 158, 11, 0.7)',
                                'rgba(59, 130, 246, 0.7)',
                                'rgba(139, 92, 246, 0.7)'
                            ],
                            borderColor: [
                                'rgba(79, 70, 229, 1)',
                                'rgba(16, 185, 129, 1)',
                                'rgba(245, 158, 11, 1)',
                                'rgba(59, 130, 246, 1)',
                                'rgba(139, 92, 246, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    precision: 0
                                }
                            }
                        }
                    }
                });
            },
            
            renderProducts() {
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                const settings = JSON.parse(localStorage.getItem('settings'));
                const lowStockThreshold = settings.lowStockThreshold || 5;
                
                // Update category filter
                const categories = [...new Set(products.map(p => p.category))];
                let categoryOptions = '<option value="">كل الفئات</option>';
                categories.forEach(cat => {
                    categoryOptions += `<option value="${cat}">${cat}</option>`;
                });
                document.getElementById('categoryFilter').innerHTML = categoryOptions;
                
                // Filter products based on search and filters
                const searchText = document.getElementById('productSearch').value.toLowerCase();
                const categoryFilter = document.getElementById('categoryFilter').value;
                const stockFilter = document.getElementById('stockFilter').value;
                
                const filteredProducts = products.filter(product => {
                    const matchesSearch = product.name.toLowerCase().includes(searchText) || 
                                         (product.code && product.code.toLowerCase().includes(searchText));
                    const matchesCategory = !categoryFilter || product.category === categoryFilter;
                    
                    let matchesStock = true;
                    if (stockFilter === 'low') {
                        matchesStock = product.quantity > 0 && product.quantity <= lowStockThreshold;
                    } else if (stockFilter === 'out') {
                        matchesStock = product.quantity === 0;
                    }
                    
                    return matchesSearch && matchesCategory && matchesStock;
                });
                
                // Generate products table
                let productsHtml = '';
                
                if (filteredProducts.length === 0) {
                    productsHtml = `<tr>
                        <td colspan="6" class="py-6 text-center text-gray-500">
                            لم يتم العثور على منتجات. أضف منتجك الأول!
                        </td>
                    </tr>`;
                } else {
                    filteredProducts.forEach(product => {
                        let stockClass = '';
                        let stockText = product.quantity;
                        
                        if (product.quantity === 0) {
                            stockClass = 'out-of-stock text-danger';
                            stockText = 'منتهي';
                        } else if (product.quantity <= lowStockThreshold) {
                            stockClass = 'low-stock text-warning';
                        }
                        
                        productsHtml += `
                        <tr>
                            <td class="py-3 px-4 font-medium">${product.name}</td>
                            <td class="py-3 px-4 text-gray-500 dark:text-gray-400">${product.code || '-'}</td>
                            <td class="py-3 px-4">${product.category || '-'}</td>
                            <td class="py-3 px-4 ${stockClass}">${stockText}</td>
                            <td class="py-3 px-4">${settings.currency || 'ج.م'} ${product.price.toFixed(2)}</td>
                            <td class="py-3 px-4 text-left">
                                <button class="edit-product-btn p-1 text-primary hover:bg-primary hover:bg-opacity-10 rounded" data-id="${product.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-product-btn p-1 text-danger hover:bg-danger hover:bg-opacity-10 rounded ml-2" data-id="${product.id}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>`;
                    });
                }
                
                document.getElementById('productsTable').innerHTML = productsHtml;
                
                // Add event listeners to edit and delete buttons
                document.querySelectorAll('.edit-product-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const productId = e.currentTarget.getAttribute('data-id');
                        this.editProduct(productId);
                    });
                });
                
                document.querySelectorAll('.delete-product-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const productId = e.currentTarget.getAttribute('data-id');
                        this.confirmDeleteProduct(productId);
                    });
                });
                
                // Add event listeners to filter inputs
                document.getElementById('productSearch').addEventListener('input', () => this.renderProducts());
                document.getElementById('categoryFilter').addEventListener('change', () => this.renderProducts());
                document.getElementById('stockFilter').addEventListener('change', () => this.renderProducts());
            },
            
            showProductModal() {
                document.getElementById('modalTitle').textContent = 'إضافة منتج';
                document.getElementById('productId').value = '';
                document.getElementById('productName').value = '';
                document.getElementById('productCode').value = '';
                document.getElementById('productCategory').value = '';
                document.getElementById('productQty').value = '';
                document.getElementById('productPriceInput').value = '';
                document.getElementById('productModal').classList.remove('hidden');
            },
            
            editProduct(id) {
                const products = JSON.parse(localStorage.getItem('products'));
                const product = products.find(p => p.id == id);
                
                if (product) {
                    document.getElementById('modalTitle').textContent = 'تعديل المنتج';
                    document.getElementById('productId').value = product.id;
                    document.getElementById('productName').value = product.name;
                    document.getElementById('productCode').value = product.code || '';
                    document.getElementById('productCategory').value = product.category || '';
                    document.getElementById('productQty').value = product.quantity;
                    document.getElementById('productPriceInput').value = product.price;
                    document.getElementById('productModal').classList.remove('hidden');
                }
            },
            
            saveProduct() {
                const id = document.getElementById('productId').value;
                const name = document.getElementById('productName').value.trim();
                const code = document.getElementById('productCode').value.trim();
                const category = document.getElementById('productCategory').value.trim();
                const quantity = parseInt(document.getElementById('productQty').value) || 0;
                const price = parseFloat(document.getElementById('productPriceInput').value) || 0;
                
                if (!name) {
                    this.showAlert('اسم المنتج حقل مطلوب', 'error');
                    return;
                }
                
                let products = JSON.parse(localStorage.getItem('products'));
                
                if (id) {
                    // Update existing product
                    const index = products.findIndex(p => p.id == id);
                    if (index !== -1) {
                        products[index] = { ...products[index], name, code, category, quantity, price };
                    }
                } else {
                    // Add new product
                    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                    products.push({ id: newId, name, code, category, quantity, price });
                }
                
                localStorage.setItem('products', JSON.stringify(products));
                this.closeProductModal();
                this.renderProducts();
                this.checkLowStock();
            },
            
            closeProductModal() {
                document.getElementById('productModal').classList.add('hidden');
            },
            
            confirmDeleteProduct(id) {
                const products = JSON.parse(localStorage.getItem('products'));
                const product = products.find(p => p.id == id);
                
                if (product) {
                    document.getElementById('confirmTitle').textContent = 'حذف المنتج';
                    document.getElementById('confirmMessage').textContent = `هل أنت متأكد أنك تريد حذف "${product.name}"؟ لا يمكن التراجع عن هذا الإجراء.`;
                    document.getElementById('confirmModal').classList.remove('hidden');
                    
                    document.getElementById('confirmOk').onclick = () => {
                        this.deleteProduct(id);
                        this.closeConfirmModal();
                    };
                }
            },
            
            deleteProduct(id) {
                let products = JSON.parse(localStorage.getItem('products'));
                products = products.filter(p => p.id != id);
                localStorage.setItem('products', JSON.stringify(products));
                this.renderProducts();
            },
            
            closeConfirmModal() {
                document.getElementById('confirmModal').classList.add('hidden');
            },
            
            setupSalesPage() {
                // Populate product dropdown
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                let productOptions = '<option value="">اختر منتج</option>';
                
                products.filter(p => p.quantity > 0).forEach(product => {
                    productOptions += `<option value="${product.id}">${product.name}</option>`;
                });
                
                document.getElementById('productSelect').innerHTML = productOptions;
                
                // Clear cart
                this.clearCart();
            },
            
            updateProductInfo(productId) {
                if (!productId) {
                    document.getElementById('productPriceDisplay').textContent = 'السعر: ج.م 0.00';
                    document.getElementById('availableStock').textContent = 'المتاح: 0';
                    return;
                }
                
                const products = JSON.parse(localStorage.getItem('products'));
                const product = products.find(p => p.id == productId);
                const settings = JSON.parse(localStorage.getItem('settings'));
                
                if (product) {
                    document.getElementById('productPriceDisplay').textContent = `السعر: ${settings.currency || 'ج.م'} ${product.price.toFixed(2)}`;
                    document.getElementById('availableStock').textContent = `المتاح: ${product.quantity}`;
                }
            },
            
            addToCart() {
                const productId = document.getElementById('productSelect').value;
                const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
                
                if (!productId) {
                    this.showAlert('الرجاء اختيار منتج', 'error');
                    return;
                }
                
                const products = JSON.parse(localStorage.getItem('products'));
                const product = products.find(p => p.id == productId);
                
                if (!product) {
                    this.showAlert('المنتج غير موجود', 'error');
                    return;
                }
                
                if (quantity > product.quantity) {
                    this.showAlert(`الكمية المتاحة فقط ${product.quantity}`, 'error');
                    return;
                }
                
                // Check if product already in cart
                let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
                const existingItemIndex = cart.findIndex(item => item.productId == productId);
                
                if (existingItemIndex !== -1) {
                    // Update existing item
                    const newQuantity = cart[existingItemIndex].quantity + quantity;
                    if (newQuantity > product.quantity) {
                        this.showAlert(`ستتجاوز الكمية المتاحة (${product.quantity})`, 'error');
                        return;
                    }
                    cart[existingItemIndex].quantity = newQuantity;
                    cart[existingItemIndex].total = newQuantity * cart[existingItemIndex].unitPrice;
                } else {
                    // Add new item
                    cart.push({
                        productId: product.id,
                        name: product.name,
                        unitPrice: product.price,
                        quantity: quantity,
                        total: product.price * quantity
                    });
                }
                
                sessionStorage.setItem('cart', JSON.stringify(cart));
                this.renderCart();
            },
            
            renderCart() {
                const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
                const settings = JSON.parse(localStorage.getItem('settings'));
                let cartHtml = '';
                
                if (cart.length === 0) {
                    cartHtml = `<tr>
                        <td colspan="5" class="py-4 text-center text-gray-500">سلة المشتريات فارغة</td>
                    </tr>`;
                } else {
                    cart.forEach((item, index) => {
                        cartHtml += `
                        <tr>
                            <td class="py-2 px-3">${item.name}</td>
                            <td class="py-2 px-3">${settings.currency || 'ج.م'} ${item.unitPrice.toFixed(2)}</td>
                            <td class="py-2 px-3">
                                <input type="number" min="1" value="${item.quantity}" class="cart-qty-input w-16 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded px-2 py-1" data-index="${index}">
                            </td>
                            <td class="py-2 px-3">${settings.currency || 'ج.م'} ${item.total.toFixed(2)}</td>
                            <td class="py-2 px-3 text-center">
                                <button class="remove-cart-item text-danger" data-index="${index}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>`;
                    });
                }
                
                document.getElementById('cartItems').innerHTML = cartHtml;
                
                // Add event listeners to quantity inputs
                document.querySelectorAll('.cart-qty-input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const index = e.target.getAttribute('data-index');
                        this.updateCartItemQuantity(index, parseInt(e.target.value) || 1);
                    });
                });
                
                // Add event listeners to remove buttons
                document.querySelectorAll('.remove-cart-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = e.currentTarget.getAttribute('data-index');
                        this.removeCartItem(index);
                    });
                });
                
                // Update totals
                const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
                document.getElementById('cartSubtotal').textContent = `${settings.currency || 'ج.م'} ${subtotal.toFixed(2)}`;
                document.getElementById('cartTotal').textContent = `${settings.currency || 'ج.م'} ${subtotal.toFixed(2)}`;
            },
            
            updateCartItemQuantity(index, newQuantity) {
                let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
                const products = JSON.parse(localStorage.getItem('products'));
                const item = cart[index];
                
                if (!item) return;
                
                const product = products.find(p => p.id == item.productId);
                if (!product) return;
                
                if (newQuantity > product.quantity) {
                    this.showAlert(`الكمية المتاحة فقط ${product.quantity}`, 'error');
                    document.querySelector(`.cart-qty-input[data-index="${index}"]`).value = item.quantity;
                    return;
                }
                
                cart[index].quantity = newQuantity;
                cart[index].total = newQuantity * cart[index].unitPrice;
                
                sessionStorage.setItem('cart', JSON.stringify(cart));
                this.renderCart();
            },
            
            removeCartItem(index) {
                let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
                cart.splice(index, 1);
                sessionStorage.setItem('cart', JSON.stringify(cart));
                this.renderCart();
            },
            
            clearCart() {
                sessionStorage.removeItem('cart');
                this.renderCart();
                document.getElementById('saleNotes').value = '';
                document.getElementById('customerName').value = '';
                document.getElementById('saleSuccess').classList.add('hidden');
            },
            
            completeSale(showPreview = true) {
                const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
                if (cart.length === 0) {
                    this.showAlert('سلة المشتريات فارغة', 'error');
                    return;
                }
                
                const customerName = document.getElementById('customerName').value.trim() || 'عميل بدون اسم';
                const date = new Date().toISOString();
                const notes = document.getElementById('saleNotes').value;
                
                // Calculate total
                const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
                
                // Create sale object
                const sale = {
                    id: Date.now(),
                    date: date,
                    customerName: customerName,
                    items: cart.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                        total: item.total
                    })),
                    totalAmount: totalAmount,
                    notes: notes,
                    hasReturns: false // Initialize hasReturns flag
                };
                
                // Update inventory
                let products = JSON.parse(localStorage.getItem('products'));
                cart.forEach(cartItem => {
                    const productIndex = products.findIndex(p => p.id == cartItem.productId);
                    if (productIndex !== -1) {
                        products[productIndex].quantity -= cartItem.quantity;
                        if (products[productIndex].quantity < 0) products[productIndex].quantity = 0;
                    }
                });
                
                // Save updated products
                localStorage.setItem('products', JSON.stringify(products));
                
                // Save sale
                let sales = JSON.parse(localStorage.getItem('sales') || '[]');
                sales.unshift(sale); // Add to beginning of array to show newest first
                localStorage.setItem('sales', JSON.stringify(sales));
                
                // Update customer data if exists
                let customers = JSON.parse(localStorage.getItem('customers') || '[]');
                const customerIndex = customers.findIndex(c => c.name === customerName);
                if (customerIndex !== -1) {
                    customers[customerIndex].purchaseCount += 1;
                    customers[customerIndex].totalPurchases += totalAmount;
                    localStorage.setItem('customers', JSON.stringify(customers));
                }
                
                // Show success message
                document.getElementById('saleSuccess').classList.remove('hidden');
                
                // Clear cart after a delay
                setTimeout(() => {
                    this.clearCart();
                    this.loadDashboard();
                }, 2000);
                
                // Generate invoice and show preview if requested
                if (showPreview) {
                    this.generateInvoice(sale);
                    this.showInvoiceModal();
                } else {
                    this.showAlert('تم تأكيد البيع وإضافة الفاتورة بنجاح', 'success');
                }
            },
            
            generateInvoice(sale) {
                const invoiceContent = document.getElementById('invoiceContent');
                const settings = JSON.parse(localStorage.getItem('settings'));
                
                invoiceContent.innerHTML = `
                    <div class="max-w-4xl mx-auto">
                        <div class="flex justify-between items-start mb-8">
                            <div>
                                <h1 class="text-3xl font-bold">فاتورة مبيعات</h1>
                                <p class="text-gray-500">رقم #${sale.id}</p>
                            </div>
                            <div class="text-left">
                                <p class="text-2xl font-bold">نظام المخزون</p>
                                <p class="text-gray-500">${new Date(sale.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h2 class="text-lg font-medium mb-2">العميل:</h2>
                                <p class="font-medium">${sale.customerName}</p>
                            </div>
                            <div class="text-left">
                                <p><span class="font-medium">رقم الفاتورة:</span> ${sale.id}</p>
                                <p><span class="font-medium">التاريخ:</span> ${new Date(sale.date).toLocaleDateString('ar-EG')}</p>
                            </div>
                        </div>
                        
                        <table class="w-full mb-8">
                            <thead class="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th class="text-right py-3 px-4">المنتج</th>
                                    <th class="text-right py-3 px-4">السعر</th>
                                    <th class="text-right py-3 px-4">الكمية</th>
                                    <th class="text-right py-3 px-4">المجموع</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sale.items.map(item => `
                                    <tr>
                                        <td class="py-3 px-4 border-b text-right">${item.name}</td>
                                        <td class="py-3 px-4 border-b text-right">${settings.currency || 'ج.م'} ${item.unitPrice.toFixed(2)}</td>
                                        <td class="py-3 px-4 border-b text-right">${item.quantity}</td>
                                        <td class="py-3 px-4 border-b text-right">${settings.currency || 'ج.م'} ${item.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="py-3 px-4 text-right font-medium">المجموع الفرعي</td>
                                    <td class="py-3 px-4 text-right">${settings.currency || 'ج.م'} ${sale.totalAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" class="py-3 px-4 text-right font-medium">الإجمالي</td>
                                    <td class="py-3 px-4 text-right font-bold text-lg">${settings.currency || 'ج.م'} ${sale.totalAmount.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <div class="mb-4">
                            <h2 class="text-lg font-medium mb-2">ملاحظات</h2>
                            <p class="text-gray-600">${sale.notes || 'لا توجد ملاحظات'}</p>
                        </div>
                        
                        <div class="mt-12 pt-8 border-t border-gray-300 text-center text-gray-500">
                            <p>شكراً لتعاملك معنا!</p>
                            <p>نظام المخزون والمبيعات</p>
                        </div>
                    </div>
                `;
            },
            
            showInvoiceModal() {
                document.getElementById('invoiceModal').classList.remove('hidden');
                
                // Set up download button
                document.getElementById('downloadInvoiceBtn').onclick = () => {
                    const element = document.getElementById('invoiceContent');
                    const opt = {
                        margin: 0.5,
                        filename: `فاتورة-${Date.now()}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    };
                    
                    html2pdf().set(opt).from(element).save();
                };
            },
            
            closeInvoiceModal() {
                document.getElementById('invoiceModal').classList.add('hidden');
            },
            
            renderInvoices() {
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const returns = JSON.parse(localStorage.getItem('returns') || '[]');
                const settings = JSON.parse(localStorage.getItem('settings'));
                const showReturnsOnly = document.getElementById('showReturnsOnly').checked;
                
                // Group sales by date for organization
                const salesByDate = {};
                sales.forEach(sale => {
                    const saleDate = new Date(sale.date).toLocaleDateString('ar-EG');
                    if (!salesByDate[saleDate]) {
                        salesByDate[saleDate] = [];
                    }
                    salesByDate[saleDate].push(sale);
                });
                
                let invoicesHtml = '';
                
                if (sales.length === 0) {
                    invoicesHtml = `<tr>
                        <td colspan="6" class="py-6 text-center text-gray-500">
                            لا توجد فواتير
                        </td>
                    </tr>`;
                } else {
                    // Sort dates in descending order
                    const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(b) - new Date(a));
                    
                    sortedDates.forEach(date => {
                        // Add date separator
                        invoicesHtml += `<tr class="date-separator"><td colspan="6">${date}</td></tr>`;
                        
                        // Add sales for this date (already sorted by date in descending order)
                        salesByDate[date].forEach(sale => {
                            // Check if this sale has returns
                            const saleReturns = returns.filter(ret => ret.invoiceId == sale.id);
                            const hasReturns = saleReturns.length > 0;
                            
                            // Skip if showing returns only and this sale has no returns
                            if (showReturnsOnly && !hasReturns) return;
                            
                            invoicesHtml += `
                            <tr class="${hasReturns ? 'has-return' : ''}">
                                <td class="py-3 px-4">${sale.id}</td>
                                <td class="py-3 px-4">${new Date(sale.date).toLocaleDateString('ar-EG')}</td>
                                <td class="py-3 px-4">${sale.customerName || 'عميل بدون اسم'}</td>
                                <td class="py-3 px-4">${sale.items.length}</td>
                                <td class="py-3 px-4">${settings.currency || 'ج.م'} ${sale.totalAmount.toFixed(2)}</td>
                                <td class="py-3 px-4 text-left">
                                    <button class="view-invoice-btn p-1 text-primary hover:bg-primary hover:bg-opacity-10 rounded" data-id="${sale.id}">
                                        <i class="fas fa-eye mr-1"></i> عرض
                                    </button>
                                    <button class="download-invoice-btn p-1 text-secondary hover:bg-secondary hover:bg-opacity-10 rounded ml-2" data-id="${sale.id}">
                                        <i class="fas fa-download mr-1"></i> PDF
                                    </button>
                                    <button class="return-invoice-btn p-1 text-warning hover:bg-warning hover:bg-opacity-10 rounded ml-2" data-id="${sale.id}">
                                        <i class="fas fa-undo mr-1"></i> إرجاع
                                    </button>
                                    <button class="delete-invoice-btn p-1 text-danger hover:bg-danger hover:bg-opacity-10 rounded ml-2" data-id="${sale.id}">
                                        <i class="fas fa-trash-alt mr-1"></i> حذف
                                    </button>
                                </td>
                            </tr>`;
                        });
                    });
                }
                
                document.getElementById('invoicesTable').innerHTML = invoicesHtml;
                
                // Add event listeners to invoice buttons
                document.querySelectorAll('.view-invoice-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const saleId = e.currentTarget.getAttribute('data-id');
                        this.viewInvoice(saleId);
                    });
                });
                
                document.querySelectorAll('.download-invoice-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const saleId = e.currentTarget.getAttribute('data-id');
                        this.downloadInvoice(saleId);
                    });
                });
                
                document.querySelectorAll('.return-invoice-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const saleId = e.currentTarget.getAttribute('data-id');
                        this.showReturnModal(saleId);
                    });
                });
                
                document.querySelectorAll('.delete-invoice-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const saleId = e.currentTarget.getAttribute('data-id');
                        this.confirmDeleteInvoice(saleId);
                    });
                });
            },
            
            viewInvoice(saleId) {
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const sale = sales.find(s => s.id == saleId);
                
                if (sale) {
                    this.generateInvoice(sale);
                    this.showInvoiceModal();
                }
            },
            
            downloadInvoice(saleId) {
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const sale = sales.find(s => s.id == saleId);
                
                if (sale) {
                    this.generateInvoice(sale);
                    
                    // Give a moment for the invoice to render
                    setTimeout(() => {
                        const element = document.getElementById('invoiceContent');
                        const opt = {
                            margin: 0.5,
                            filename: `فاتورة-${saleId}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2 },
                            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                        };
                        
                        html2pdf().set(opt).from(element).save();
                    }, 100);
                }
            },
            
            showReturnModal(invoiceId) {
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const sale = sales.find(s => s.id == invoiceId);
                
                if (!sale) return;
                
                // Populate product select
                let productOptions = '<option value="">اختر منتج للإرجاع</option>';
                sale.items.forEach(item => {
                    productOptions += `<option value="${item.productId}" data-price="${item.unitPrice}" data-quantity="${item.quantity}">${item.name} (${item.quantity})</option>`;
                });
                
                document.getElementById('returnInvoiceId').value = invoiceId;
                document.getElementById('returnCustomerName').value = sale.customerName || 'عميل بدون اسم';
                document.getElementById('returnProductSelect').innerHTML = productOptions;
                document.getElementById('returnSoldQty').value = '';
                document.getElementById('returnQty').value = '';
                document.getElementById('returnPrice').value = '';
                document.getElementById('returnReason').value = '';
                document.getElementById('otherReasonContainer').classList.add('hidden');
                document.getElementById('otherReturnReason').value = '';
                
                document.getElementById('returnModal').classList.remove('hidden');
            },
            
            updateReturnProductInfo(productId) {
                if (!productId) {
                    document.getElementById('returnSoldQty').value = '';
                    document.getElementById('returnQty').value = '';
                    document.getElementById('returnPrice').value = '';
                    return;
                }
                
                const selectedOption = document.getElementById('returnProductSelect').options[document.getElementById('returnProductSelect').selectedIndex];
                const maxQuantity = parseInt(selectedOption.getAttribute('data-quantity'));
                const unitPrice = parseFloat(selectedOption.getAttribute('data-price'));
                
                document.getElementById('returnSoldQty').value = maxQuantity;
                document.getElementById('returnQty').setAttribute('max', maxQuantity);
                document.getElementById('returnQty').value = 1;
                document.getElementById('returnPrice').value = unitPrice.toFixed(2);
                document.getElementById('returnPrice').setAttribute('data-unitprice', unitPrice);
                document.getElementById('returnPrice').removeAttribute('readonly'); // جعل حقل السعر قابل للتعديل
            },
            
            updateReturnPrice() {
                const quantity = parseInt(document.getElementById('returnQty').value) || 0;
                const unitPrice = parseFloat(document.getElementById('returnPrice').value) || 0;
                const returnPrice = quantity * unitPrice;
                document.getElementById('returnPrice').value = returnPrice.toFixed(2);
            },
            
            processReturn() {
                const invoiceId = document.getElementById('returnInvoiceId').value;
                const productId = document.getElementById('returnProductSelect').value;
                const quantity = parseInt(document.getElementById('returnQty').value) || 0;
                const price = parseFloat(document.getElementById('returnPrice').value) || 0;
                const reason = document.getElementById('returnReason').value;
                const otherReason = document.getElementById('otherReturnReason').value;
                const finalReason = reason === 'آخر' ? otherReason : reason;
                const customerName = document.getElementById('returnCustomerName').value;
                
                if (!invoiceId || !productId || !quantity || quantity <= 0) {
                    this.showAlert('الرجاء إدخال بيانات الإرجاع كاملة', 'error');
                    return;
                }
                
                // Get original sale
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const saleIndex = sales.findIndex(s => s.id == invoiceId);
                if (saleIndex === -1) {
                    this.showAlert('لا يمكن العثور على الفاتورة الأصلية', 'error');
                    return;
                }
                
                const sale = sales[saleIndex];
                
                // Check if product exists in sale
                const itemIndex = sale.items.findIndex(i => i.productId == productId);
                if (itemIndex === -1) {
                    this.showAlert('لا يمكن العثور على المنتج في الفاتورة الأصلية', 'error');
                    return;
                }
                
                const item = sale.items[itemIndex];
                
                if (quantity > item.quantity) {
                    this.showAlert('لا يمكن إرجاع كمية أكبر من الكمية المباعة', 'error');
                    return;
                }
                
                // Update inventory
                let products = JSON.parse(localStorage.getItem('products'));
                const productIndex = products.findIndex(p => p.id == productId);
                if (productIndex !== -1) {
                    products[productIndex].quantity += quantity;
                    localStorage.setItem('products', JSON.stringify(products));
                }
                
                // Create return record
                const returnRecord = {
                    id: Date.now(),
                    invoiceId: invoiceId,
                    date: new Date().toISOString(),
                    productId: productId,
                    productName: item.name,
                    quantity: quantity,
                    amount: price,
                    reason: finalReason,
                    unitPrice: price / quantity,
                    customerName: customerName
                };
                
                let returns = JSON.parse(localStorage.getItem('returns') || '[]');
                returns.unshift(returnRecord); // Add to beginning of array to show newest first
                localStorage.setItem('returns', JSON.stringify(returns));
                
                // Update customer data if exists
                let customers = JSON.parse(localStorage.getItem('customers') || '[]');
                const customerIndex = customers.findIndex(c => c.name === sale.customerName);
                if (customerIndex !== -1) {
                    customers[customerIndex].totalPurchases -= price;
                    localStorage.setItem('customers', JSON.stringify(customers));
                }
                
                // Update the original sale
                if (quantity === item.quantity) {
                    // Remove the item completely if all quantity is returned
                    sale.items.splice(itemIndex, 1);
                } else {
                    // Update the quantity and total for the item
                    sale.items[itemIndex].quantity -= quantity;
                    sale.items[itemIndex].total = sale.items[itemIndex].quantity * sale.items[itemIndex].unitPrice;
                }
                
                // Recalculate the sale total
                sale.totalAmount = sale.items.reduce((sum, item) => sum + item.total, 0);
                
                // Mark sale as having returns
                sale.hasReturns = true;
                
                // Update the sale in storage
                sales[saleIndex] = sale;
                localStorage.setItem('sales', JSON.stringify(sales));
                
                // Close modal
                this.closeReturnModal();
                
                // Refresh data
                this.renderInvoices();
                this.renderReturns();
                this.loadDashboard();
                
                // Show custom success message
                this.showAlert('تمت عملية الإرجاع بنجاح', 'success');
            },
            
            closeReturnModal() {
                document.getElementById('returnModal').classList.add('hidden');
            },
            
            renderReturns() {
                const returns = JSON.parse(localStorage.getItem('returns') || '[]');
                const settings = JSON.parse(localStorage.getItem('settings'));
                
                // Group returns by date for organization
                const returnsByDate = {};
                returns.forEach(ret => {
                    const returnDate = new Date(ret.date).toLocaleDateString('ar-EG');
                    if (!returnsByDate[returnDate]) {
                        returnsByDate[returnDate] = [];
                    }
                    returnsByDate[returnDate].push(ret);
                });
                
                let returnsHtml = '';
                
                if (returns.length === 0) {
                    returnsHtml = `<tr>
                        <td colspan="7" class="py-6 text-center text-gray-500">
                            لا توجد مرتجعات
                        </td>
                    </tr>`;
                } else {
                    // Sort dates in descending order
                    const sortedDates = Object.keys(returnsByDate).sort((a, b) => new Date(b) - new Date(a));
                    
                    sortedDates.forEach(date => {
                        // Add date separator
                        returnsHtml += `<tr class="date-separator"><td colspan="7">${date}</td></tr>`;
                        
                        // Add returns for this date (already sorted by date in descending order)
                        returnsByDate[date].forEach(ret => {
                            returnsHtml += `
                            <tr>
                                <td class="py-3 px-4">${ret.id}</td>
                                <td class="py-3 px-4">${ret.invoiceId}</td>
                                <td class="py-3 px-4">${new Date(ret.date).toLocaleDateString('ar-EG')}</td>
                                <td class="py-3 px-4">${ret.productName}</td>
                                <td class="py-3 px-4">${ret.quantity}</td>
                                <td class="py-3 px-4">${settings.currency || 'ج.م'} ${ret.amount.toFixed(2)}</td>
                                <td class="py-3 px-4 text-left">
                                    <button class="view-return-btn p-1 text-primary hover:bg-primary hover:bg-opacity-10 rounded" data-id="${ret.id}">
                                        <i class="fas fa-eye mr-1"></i> عرض
                                    </button>
                                    <button class="view-original-invoice-btn p-1 text-secondary hover:bg-secondary hover:bg-opacity-10 rounded ml-2" data-id="${ret.invoiceId}">
                                        <i class="fas fa-receipt mr-1"></i> الفاتورة الأصلية
                                    </button>
                                    <button class="restore-return-btn p-1 text-warning hover:bg-warning hover:bg-opacity-10 rounded ml-2" data-id="${ret.id}">
                                        <i class="fas fa-redo mr-1"></i> استعادة
                                    </button>
                                    <button class="delete-return-btn p-1 text-danger hover:bg-danger hover:bg-opacity-10 rounded ml-2" data-id="${ret.id}">
                                        <i class="fas fa-trash-alt mr-1"></i> حذف
                                    </button>
                                </td>
                            </tr>`;
                        });
                    });
                }
                
                document.getElementById('returnsTable').innerHTML = returnsHtml;
                
                // Add event listeners to return buttons
                document.querySelectorAll('.view-return-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const returnId = e.currentTarget.getAttribute('data-id');
                        this.viewReturn(returnId);
                    });
                });
                
                document.querySelectorAll('.view-original-invoice-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const invoiceId = e.currentTarget.getAttribute('data-id');
                        this.viewInvoice(invoiceId);
                    });
                });
                
                document.querySelectorAll('.restore-return-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const returnId = e.currentTarget.getAttribute('data-id');
                        this.restoreReturn(returnId);
                    });
                });
                
                document.querySelectorAll('.delete-return-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const returnId = e.currentTarget.getAttribute('data-id');
                        this.confirmDeleteReturn(returnId);
                    });
                });
            },
            
            viewReturn(returnId) {
                const returns = JSON.parse(localStorage.getItem('returns') || '[]');
                const returnRecord = returns.find(r => r.id == returnId);
                
                if (returnRecord) {
                    alert(`تفاصيل الإرجاع:
رقم الإرجاع: ${returnRecord.id}
رقم الفاتورة: ${returnRecord.invoiceId}
المنتج: ${returnRecord.productName}
الكمية: ${returnRecord.quantity}
المبلغ: ${returnRecord.amount}
السبب: ${returnRecord.reason || 'لم يتم تحديد سبب'}`);
                }
            },
            
            restoreReturn(returnId) {
                const returns = JSON.parse(localStorage.getItem('returns') || '[]');
                const returnIndex = returns.findIndex(r => r.id == returnId);
                
                if (returnIndex === -1) return;
                
                const returnRecord = returns[returnIndex];
                
                // Get original sale
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const saleIndex = sales.findIndex(s => s.id == returnRecord.invoiceId);
                
                if (saleIndex === -1) {
                    this.showAlert('لا يمكن العثور على الفاتورة الأصلية', 'error');
                    return;
                }
                
                const sale = sales[saleIndex];
                
                // Check if product exists in sale
                const itemIndex = sale.items.findIndex(i => i.productId == returnRecord.productId);
                
                if (itemIndex === -1) {
                    // Add the product back to the sale
                    sale.items.push({
                        productId: returnRecord.productId,
                        name: returnRecord.productName,
                        unitPrice: returnRecord.unitPrice,
                        quantity: returnRecord.quantity,
                        total: returnRecord.amount
                    });
                } else {
                    // Update the existing item
                    sale.items[itemIndex].quantity += returnRecord.quantity;
                    sale.items[itemIndex].total = sale.items[itemIndex].quantity * sale.items[itemIndex].unitPrice;
                }
                
                // Recalculate the sale total
                sale.totalAmount = sale.items.reduce((sum, item) => sum + item.total, 0);
                
                // Update inventory
                let products = JSON.parse(localStorage.getItem('products'));
                const productIndex = products.findIndex(p => p.id == returnRecord.productId);
                
                if (productIndex !== -1) {
                    if (products[productIndex].quantity < returnRecord.quantity) {
                        this.showAlert('لا يوجد مخزون كافي لاستعادة هذا الإرجاع', 'error');
                        return;
                    }
                    
                    products[productIndex].quantity -= returnRecord.quantity;
                    localStorage.setItem('products', JSON.stringify(products));
                }
                
                // Update customer data if exists
                let customers = JSON.parse(localStorage.getItem('customers') || '[]');
                const customerIndex = customers.findIndex(c => c.name === sale.customerName);
                
                if (customerIndex !== -1) {
                    customers[customerIndex].totalPurchases += returnRecord.amount;
                    localStorage.setItem('customers', JSON.stringify(customers));
                }
                
                // Remove return record
                returns.splice(returnIndex, 1);
                localStorage.setItem('returns', JSON.stringify(returns));
                
                // Check if sale still has returns
                const saleReturns = returns.filter(ret => ret.invoiceId == sale.id);
                sales[saleIndex].hasReturns = saleReturns.length > 0;
                localStorage.setItem('sales', JSON.stringify(sales));
                
                // Refresh data
                this.renderInvoices();
                this.renderReturns();
                this.loadDashboard();
                
                this.showAlert('تم استعادة الإرجاع بنجاح', 'success');
            },
            
            confirmDeleteInvoice(invoiceId) {
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const sale = sales.find(s => s.id == invoiceId);
                
                if (sale) {
                    document.getElementById('confirmTitle').textContent = 'حذف الفاتورة';
                    document.getElementById('confirmMessage').textContent = `هل أنت متأكد أنك تريد حذف الفاتورة رقم ${invoiceId}؟ لا يمكن التراجع عن هذا الإجراء.`;
                    document.getElementById('confirmModal').classList.remove('hidden');
                    
                    document.getElementById('confirmOk').onclick = () => {
                        this.deleteInvoice(invoiceId);
                        this.closeConfirmModal();
                    };
                }
            },
            
            deleteInvoice(invoiceId) {
                let sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const saleIndex = sales.findIndex(s => s.id == invoiceId);
                
                if (saleIndex === -1) return;
                
                const sale = sales[saleIndex];
                
                // Restore inventory
                let products = JSON.parse(localStorage.getItem('products'));
                sale.items.forEach(item => {
                    const productIndex = products.findIndex(p => p.id == item.productId);
                    if (productIndex !== -1) {
                        products[productIndex].quantity += item.quantity;
                    }
                });
                localStorage.setItem('products', JSON.stringify(products));
                
                // Update customer data if exists
                let customers = JSON.parse(localStorage.getItem('customers') || '[]');
                const customerIndex = customers.findIndex(c => c.name === sale.customerName);
                if (customerIndex !== -1) {
                    customers[customerIndex].purchaseCount -= 1;
                    customers[customerIndex].totalPurchases -= sale.totalAmount;
                    localStorage.setItem('customers', JSON.stringify(customers));
                }
                
                // Remove sale
                sales.splice(saleIndex, 1);
                localStorage.setItem('sales', JSON.stringify(sales));
                
                // Remove associated returns
                let returns = JSON.parse(localStorage.getItem('returns') || '[]');
                returns = returns.filter(ret => ret.invoiceId != invoiceId);
                localStorage.setItem('returns', JSON.stringify(returns));
                
                this.renderInvoices();
                this.renderReturns();
                this.loadDashboard();
            },
            
            confirmDeleteReturn(returnId) {
                const returns = JSON.parse(localStorage.getItem('returns') || '[]');
                const returnRecord = returns.find(r => r.id == returnId);
                
                if (returnRecord) {
                    document.getElementById('confirmTitle').textContent = 'حذف المرتجع';
                    document.getElementById('confirmMessage').textContent = `هل أنت متأكد أنك تريد حذف المرتجع رقم ${returnId}؟ لا يمكن التراجع عن هذا الإجراء.`;
                    document.getElementById('confirmModal').classList.remove('hidden');
                    
                    document.getElementById('confirmOk').onclick = () => {
                        this.deleteReturn(returnId);
                        this.closeConfirmModal();
                    };
                }
            },
            
            deleteReturn(returnId) {
                let returns = JSON.parse(localStorage.getItem('returns') || '[]');
                const returnIndex = returns.findIndex(r => r.id == returnId);
                
                if (returnIndex === -1) return;
                
                const returnRecord = returns[returnIndex];
                
                // Update inventory
                let products = JSON.parse(localStorage.getItem('products'));
                const productIndex = products.findIndex(p => p.id == returnRecord.productId);
                
                if (productIndex !== -1) {
                    products[productIndex].quantity -= returnRecord.quantity;
                    localStorage.setItem('products', JSON.stringify(products));
                }
                
                // Update customer data if exists
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const sale = sales.find(s => s.id == returnRecord.invoiceId);
                
                if (sale) {
                    let customers = JSON.parse(localStorage.getItem('customers') || '[]');
                    const customerIndex = customers.findIndex(c => c.name === sale.customerName);
                    
                    if (customerIndex !== -1) {
                        customers[customerIndex].totalPurchases += returnRecord.amount;
                        localStorage.setItem('customers', JSON.stringify(customers));
                    }
                }
                
                // Remove return
                returns.splice(returnIndex, 1);
                localStorage.setItem('returns', JSON.stringify(returns));
                
                // Check if sale still has returns
                const saleReturns = returns.filter(ret => ret.invoiceId == returnRecord.invoiceId);
                const saleIndex = sales.findIndex(s => s.id == returnRecord.invoiceId);
                
                if (saleIndex !== -1) {
                    sales[saleIndex].hasReturns = saleReturns.length > 0;
                    localStorage.setItem('sales', JSON.stringify(sales));
                }
                
                this.renderInvoices();
                this.renderReturns();
                this.loadDashboard();
            },
            
            renderCustomers() {
                const customers = JSON.parse(localStorage.getItem('customers') || '[]');
                const settings = JSON.parse(localStorage.getItem('settings'));
                let customersHtml = '';
                
                if (customers.length === 0) {
                    customersHtml = `<tr>
                        <td colspan="5" class="py-6 text-center text-gray-500">
                            لا توجد عملاء مسجلين
                        </td>
                    </tr>`;
                } else {
                    customers.forEach(customer => {
                        customersHtml += `
                        <tr>
                            <td class="py-3 px-4 font-medium">${customer.name}</td>
                            <td class="py-3 px-4">${customer.phone}</td>
                            <td class="py-3 px-4">${customer.purchaseCount}</td>
                            <td class="py-3 px-4">${settings.currency || 'ج.م'} ${customer.totalPurchases.toFixed(2)}</td>
                            <td class="py-3 px-4 text-left">
                                <button class="edit-customer-btn p-1 text-primary hover:bg-primary hover:bg-opacity-10 rounded" data-id="${customer.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-customer-btn p-1 text-danger hover:bg-danger hover:bg-opacity-10 rounded ml-2" data-id="${customer.id}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>`;
                    });
                }
                
                document.getElementById('customersTable').innerHTML = customersHtml;
                
                // Add event listeners to edit and delete buttons
                document.querySelectorAll('.edit-customer-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const customerId = e.currentTarget.getAttribute('data-id');
                        this.editCustomer(customerId);
                    });
                });
                
                document.querySelectorAll('.delete-customer-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const customerId = e.currentTarget.getAttribute('data-id');
                        this.confirmDeleteCustomer(customerId);
                    });
                });
            },
            
            showCustomerModal() {
                document.getElementById('customerModalTitle').textContent = 'إضافة عميل';
                document.getElementById('customerId').value = '';
                document.getElementById('customerNameInput').value = '';
                document.getElementById('customerPhone').value = '';
                document.getElementById('customerEmail').value = '';
                document.getElementById('customerAddress').value = '';
                document.getElementById('customerModal').classList.remove('hidden');
            },
            
            editCustomer(id) {
                const customers = JSON.parse(localStorage.getItem('customers'));
                const customer = customers.find(c => c.id == id);
                
                if (customer) {
                    document.getElementById('customerModalTitle').textContent = 'تعديل عميل';
                    document.getElementById('customerId').value = customer.id;
                    document.getElementById('customerNameInput').value = customer.name;
                    document.getElementById('customerPhone').value = customer.phone;
                    document.getElementById('customerEmail').value = customer.email || '';
                    document.getElementById('customerAddress').value = customer.address || '';
                    document.getElementById('customerModal').classList.remove('hidden');
                }
            },
            
            saveCustomer() {
                const id = document.getElementById('customerId').value;
                const name = document.getElementById('customerNameInput').value.trim();
                const phone = document.getElementById('customerPhone').value.trim();
                const email = document.getElementById('customerEmail').value.trim();
                const address = document.getElementById('customerAddress').value.trim();
                
                if (!name || !phone) {
                    this.showAlert('اسم العميل ورقم الهاتف حقول مطلوبة', 'error');
                    return;
                }
                
                let customers = JSON.parse(localStorage.getItem('customers'));
                
                if (id) {
                    // Update existing customer
                    const index = customers.findIndex(c => c.id == id);
                    if (index !== -1) {
                        customers[index] = { 
                            ...customers[index], 
                            name, 
                            phone, 
                            email, 
                            address 
                        };
                    }
                } else {
                    // Add new customer
                    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
                    customers.push({ 
                        id: newId, 
                        name, 
                        phone, 
                        email, 
                        address,
                        totalPurchases: 0,
                        purchaseCount: 0
                    });
                }
                
                localStorage.setItem('customers', JSON.stringify(customers));
                this.closeCustomerModal();
                this.renderCustomers();
            },
            
            closeCustomerModal() {
                document.getElementById('customerModal').classList.add('hidden');
            },
            
            confirmDeleteCustomer(id) {
                const customers = JSON.parse(localStorage.getItem('customers'));
                const customer = customers.find(c => c.id == id);
                
                if (customer) {
                    document.getElementById('confirmTitle').textContent = 'حذف عميل';
                    document.getElementById('confirmMessage').textContent = `هل أنت متأكد أنك تريد حذف "${customer.name}"؟ لا يمكن التراجع عن هذا الإجراء.`;
                    document.getElementById('confirmModal').classList.remove('hidden');
                    
                    document.getElementById('confirmOk').onclick = () => {
                        this.deleteCustomer(id);
                        this.closeConfirmModal();
                    };
                }
            },
            
            deleteCustomer(id) {
                let customers = JSON.parse(localStorage.getItem('customers'));
                customers = customers.filter(c => c.id != id);
                localStorage.setItem('customers', JSON.stringify(customers));
                this.renderCustomers();
            },
            
            renderReports() {
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                const returns = JSON.parse(localStorage.getItem('returns') || '[]');
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                const settings = JSON.parse(localStorage.getItem('settings'));
                
                // Monthly Sales Chart
                const monthlySalesCtx = document.getElementById('monthlySalesChart');
                if (monthlySalesCtx) {
                    // Group sales by month
                    const monthlySales = {};
                    sales.forEach(sale => {
                        const date = new Date(sale.date);
                        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
                        
                        if (!monthlySales[monthYear]) {
                            monthlySales[monthYear] = 0;
                        }
                        monthlySales[monthYear] += sale.totalAmount;
                    });
                    
                    // Subtract returns
                    returns.forEach(ret => {
                        const date = new Date(ret.date);
                        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
                        
                        if (monthlySales[monthYear]) {
                            monthlySales[monthYear] -= ret.amount;
                        }
                    });
                    
                    const months = Object.keys(monthlySales).sort();
                    const salesData = months.map(month => monthlySales[month]);
                    
                    new Chart(monthlySalesCtx.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: months,
                            datasets: [{
                                label: 'المبيعات الشهرية',
                                data: salesData,
                                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                                borderColor: 'rgba(79, 70, 229, 1)',
                                borderWidth: 2,
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                }
                
                // Top Products Chart
                const topProductsCtx = document.getElementById('topProductsChart');
                if (topProductsCtx) {
                    // Calculate product sales
                    const productSales = {};
                    sales.forEach(sale => {
                        sale.items.forEach(item => {
                            if (!productSales[item.productId]) {
                                productSales[item.productId] = {
                                    name: item.name,
                                    quantity: 0
                                };
                            }
                            productSales[item.productId].quantity += item.quantity;
                        });
                    });
                    
                    // Subtract returns
                    returns.forEach(ret => {
                        if (productSales[ret.productId]) {
                            productSales[ret.productId].quantity -= ret.quantity;
                        }
                    });
                    
                    // Sort by quantity sold
                    const sortedProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
                    
                    new Chart(topProductsCtx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: sortedProducts.map(p => p.name),
                            datasets: [{
                                label: 'الكمية المباعة',
                                data: sortedProducts.map(p => p.quantity),
                                backgroundColor: [
                                    'rgba(16, 185, 129, 0.7)',
                                    'rgba(59, 130, 246, 0.7)',
                                    'rgba(139, 92, 246, 0.7)',
                                    'rgba(245, 158, 11, 0.7)',
                                    'rgba(239, 68, 68, 0.7)'
                                ],
                                borderColor: [
                                    'rgba(16, 185, 129, 1)',
                                    'rgba(59, 130, 246, 1)',
                                    'rgba(139, 92, 246, 1)',
                                    'rgba(245, 158, 11, 1)',
                                    'rgba(239, 68, 68, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        precision: 0
                                    }
                                }
                            }
                        }
                    });
                }
                
                // Returns Chart
                const returnsCtx = document.getElementById('returnsChart');
                if (returnsCtx) {
                    // Group returns by month
                    const monthlyReturns = {};
                    returns.forEach(ret => {
                        const date = new Date(ret.date);
                        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
                        
                        if (!monthlyReturns[monthYear]) {
                            monthlyReturns[monthYear] = 0;
                        }
                        monthlyReturns[monthYear] += ret.amount;
                    });
                    
                    const months = Object.keys(monthlyReturns).sort();
                    const returnsData = months.map(month => monthlyReturns[month]);
                    
                    new Chart(returnsCtx.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: months,
                            datasets: [{
                                label: 'قيمة المرتجعات الشهرية',
                                data: returnsData,
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                borderColor: 'rgba(239, 68, 68, 1)',
                                borderWidth: 2,
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                }
            },
            
            loadSettings() {
                const settings = JSON.parse(localStorage.getItem('settings'));
                
                document.getElementById('lowStockThreshold').value = settings.lowStockThreshold || 5;
                document.getElementById('currencySetting').value = settings.currency || 'ج.م';
                document.getElementById('darkModeSetting').checked = settings.darkMode || false;
            },
            
            saveSettings() {
                const settings = {
                    lowStockThreshold: parseInt(document.getElementById('lowStockThreshold').value) || 5,
                    currency: document.getElementById('currencySetting').value,
                    darkMode: document.getElementById('darkModeSetting').checked
                };
                
                localStorage.setItem('settings', JSON.stringify(settings));
                
                // Apply dark mode if changed
                if (settings.darkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                
                this.showAlert('تم حفظ الإعدادات بنجاح', 'success');
                this.loadDashboard();
            },
            
            exportAllInvoices() {
                const sales = JSON.parse(localStorage.getItem('sales') || '[]');
                
                if (sales.length === 0) {
                    this.showAlert('لا توجد فواتير للتصدير', 'error');
                    return;
                }
                
                // Create a zip file for all invoices
                this.showAlert('سيتم تصدير جميع الفواتير كملفات PDF في أرشيف مضغوط. هذه الميزة تتطلب تنفيذ إضافي.', 'success');
                // Implementation would require a zip library like JSZip
            },
            
            backupData() {
                const data = {
                    products: JSON.parse(localStorage.getItem('products')),
                    customers: JSON.parse(localStorage.getItem('customers')),
                    sales: JSON.parse(localStorage.getItem('sales')),
                    returns: JSON.parse(localStorage.getItem('returns')),
                    settings: JSON.parse(localStorage.getItem('settings'))
                };
                
                const dataStr = JSON.stringify(data);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `نسخة-احتياطية-${new Date().toISOString().split('T')[0]}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
            },
            
            restoreData(event) {
                const file = event.target.files[0];
                if (!file) return;
                
                if (confirm('استعادة البيانات ستستبدل بياناتك الحالية. هل تريد المتابعة؟')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = JSON.parse(e.target.result);
                            
                            if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
                            if (data.customers) localStorage.setItem('customers', JSON.stringify(data.customers));
                            if (data.sales) localStorage.setItem('sales', JSON.stringify(data.sales));
                            if (data.returns) localStorage.setItem('returns', JSON.stringify(data.returns));
                            if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
                            
                            this.showAlert('تم استعادة البيانات بنجاح!', 'success');
                            location.reload();
                        } catch (error) {
                            this.showAlert('خطأ في استعادة البيانات: ملف غير صالح', 'error');
                        }
                    };
                    reader.readAsText(file);
                }
                
                // Reset input to allow selecting the same file again
                event.target.value = '';
            },
            
            checkLowStock() {
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                const settings = JSON.parse(localStorage.getItem('settings'));
                const lowStockThreshold = settings.lowStockThreshold || 5;
                
                const lowStockCount = products.filter(p => p.quantity <= lowStockThreshold && p.quantity > 0).length;
                document.getElementById('lowStockCount').textContent = lowStockCount;
                
                const outOfStockCount = products.filter(p => p.quantity === 0).length;
                document.getElementById('outOfStockCount').textContent = outOfStockCount;
                
                // Update low stock items
                const lowStockItems = products.filter(p => p.quantity <= lowStockThreshold && p.quantity > 0);
                const lowStockHtml = lowStockItems.map(item => `
                    <div class="p-3 border border-warning rounded-lg bg-warning bg-opacity-10">
                        <div class="font-medium">${item.name}</div>
                        <div class="text-sm text-warning">المتبقي: ${item.quantity} فقط</div>
                    </div>
                `).join('');
                document.getElementById('lowStockItems').innerHTML = lowStockHtml || '<div class="text-gray-500 text-center py-4">لا توجد منتجات قليلة المخزون</div>';
            },
            
            showAlert(message, type = 'success') {
                const alert = document.getElementById('customAlert');
                const alertMessage = document.getElementById('alertMessage');
                
                // تحديد لون الرسالة حسب النوع
                alert.className = `custom-alert ${type}`;
                alertMessage.textContent = message;
                
                // إظهار الرسالة
                alert.classList.remove('hidden');
                
                // إخفاء الرسالة تلقائياً بعد 3 ثوان
                setTimeout(() => {
                    alert.classList.add('hidden');
                }, 3000);
            }
        };
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => App.init());




if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("Service Worker Registered"))
      .catch((err) => console.log("SW registration failed: ", err));
  });
}
