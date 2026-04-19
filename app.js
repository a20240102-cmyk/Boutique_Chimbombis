document.addEventListener('DOMContentLoaded', () => {
    // Al estar en Vercel, usamos rutas relativas para la API
    const apiUrl = '/api/muebles';

    const form = document.getElementById('mueble-form');
    const muebleIdInput = document.getElementById('mueble-id');
    const nombreInput = document.getElementById('nombre');
    const descripcionInput = document.getElementById('descripcion');
    const materialInput = document.getElementById('material');
    const precioInput = document.getElementById('precio');
    const stockInput = document.getElementById('stock');
    const cancelBtn = document.getElementById('cancel-btn');

    const searchInput = document.getElementById('search-input');
    const filterMaterial = document.getElementById('filter-material');
    const itemsPerPageSelect = document.getElementById('items-per-page');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageInfo = document.getElementById('page-info');
    const catalogCount = document.getElementById('catalog-count');

    const welcomeOverlay = document.getElementById('welcome-overlay');
    const buyerModeBtn = document.getElementById('buyer-mode-btn');
    const adminModeBtn = document.getElementById('admin-mode-btn');

    const logoutBtn = document.getElementById('logout-btn');
    const logoutOverlay = document.getElementById('logout-overlay');
    const loginAgainBtn = document.getElementById('login-again-btn');

    const grid = document.getElementById('muebles-grid');
    const categoryMenu = document.getElementById('category-menu');
    const cartCountBadge = document.getElementById('cart-count');
    const heroBadgeLabel = document.querySelector('.hero-badge-label');

    const muebleImageInput = document.getElementById('mueble-image');
    const muebleImagePreview = document.getElementById('mueble-image-preview');
    const muebleImagePlaceholder = document.getElementById('mueble-image-placeholder');

    const detailOverlay = document.getElementById('detail-overlay');
    const detailCloseBtn = document.getElementById('detail-close-btn');
    const detailCancelBtn = document.getElementById('detail-cancel-btn');
    const detailForm = document.getElementById('detail-form');
    const detailIdInput = document.getElementById('detail-id');
    const detailNombreInput = document.getElementById('detail-nombre');
    const detailDescripcionInput = document.getElementById('detail-descripcion');
    const detailMaterialInput = document.getElementById('detail-material');
    const detailPrecioInput = document.getElementById('detail-precio');
    const detailStockInput = document.getElementById('detail-stock');
    const detailImageInput = document.getElementById('detail-image');
    const detailImagePreview = document.getElementById('detail-image-preview');
    const detailImagePlaceholder = document.getElementById('detail-image-placeholder');
    const detailSubtitle = document.getElementById('detail-subtitle');

    let allMuebles = [];
    let currentPage = 1;
    let itemsPerPage = itemsPerPageSelect ? parseInt(itemsPerPageSelect.value, 10) || 8 : 8;
    let currentMode = 'buyer';
    let currentCategory = '';
    let cartItems = [];

    let pendingImageData = null;
    let detailPendingImageData = null;

    function updateCartCount() {
        if (!cartCountBadge) return;
        const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCountBadge.textContent = total;
        cartCountBadge.style.opacity = total > 0 ? '1' : '0';
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('toast-visible');
        clearTimeout(showToast.timeoutId);
        showToast.timeoutId = setTimeout(() => {
            toast.classList.remove('toast-visible');
        }, 2600);
    }

    function addToCart(mueble) {
        const existing = cartItems.find((item) => String(item.id) === String(mueble.id));
        if (existing) {
            existing.quantity += 1;
        } else {
            cartItems.push({ id: mueble.id, nombre: mueble.nombre, precio: mueble.precio, quantity: 1 });
        }
        updateCartCount();
        showToast('Se agregó "' + (mueble.nombre || 'producto') + '" al carrito');
    }

    function formatPrice(value) {
        const num = Number(value);
        if (Number.isNaN(num)) {
            return '$0.00';
        }
        return '$' + num.toFixed(2);
    }

    function getMuebleIcon(material = '') {
        const mat = material.toLowerCase();
        if (mat.includes('perfume')) return '🧴';
        if (mat.includes('ropa') && mat.includes('hombre')) return '👕';
        if (mat.includes('ropa')) return '👗';
        if (mat.includes('madera')) return '🪑';
        if (mat.includes('metal') || mat.includes('acero')) return '🛏️';
        if (mat.includes('vidrio') || mat.includes('cristal')) return '🪟';
        if (mat.includes('tela') || mat.includes('tapizado') || mat.includes('sofá') || mat.includes('sofa') || mat.includes('mueble')) return '🛋️';
        return '📦';
    }

    function updateFormImagePreview(dataUrl) {
        if (dataUrl) {
            muebleImagePreview.src = dataUrl;
            muebleImagePreview.classList.remove('hidden');
            muebleImagePlaceholder.classList.add('hidden');
        } else {
            muebleImagePreview.src = '';
            muebleImagePreview.classList.add('hidden');
            muebleImagePlaceholder.classList.remove('hidden');
        }
    }

    function updateDetailImagePreview(dataUrl) {
        if (dataUrl) {
            detailImagePreview.src = dataUrl;
            detailImagePreview.classList.remove('hidden');
            detailImagePlaceholder.classList.add('hidden');
        } else {
            detailImagePreview.src = '';
            detailImagePreview.classList.add('hidden');
            detailImagePlaceholder.classList.remove('hidden');
        }
    }

    function applyModeToLayout() {
        document.body.classList.remove('mode-buyer', 'mode-admin');
        if (currentMode === 'admin') {
            document.body.classList.add('mode-admin');
        } else {
            document.body.classList.add('mode-buyer');
        }
        if (heroBadgeLabel) {
            heroBadgeLabel.textContent = currentMode === 'admin' ? 'Modo administrador' : 'Modo comprador';
        }
    }

    function setMode(mode) {
        currentMode = mode === 'admin' ? 'admin' : 'buyer';
        applyModeToLayout();
        updateDisplay();
        if (welcomeOverlay) {
            welcomeOverlay.classList.add('hidden');
        }
        document.body.classList.remove('pre-start');
    }

    if (buyerModeBtn && adminModeBtn && welcomeOverlay) {
        buyerModeBtn.addEventListener('click', () => setMode('buyer'));
        adminModeBtn.addEventListener('click', () => setMode('admin'));
        welcomeOverlay.addEventListener('click', (e) => {
            if (e.target === welcomeOverlay) {
                setMode('buyer');
            }
        });
    } else {
        applyModeToLayout();
    }

    if (logoutBtn && logoutOverlay && loginAgainBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutOverlay.classList.remove('hidden');
        });
        loginAgainBtn.addEventListener('click', () => {
            window.location.reload();
        });
        logoutOverlay.addEventListener('click', (e) => {
            if (e.target === logoutOverlay) {
                window.location.reload();
            }
        });
    }

    if (muebleImageInput) {
        muebleImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                pendingImageData = ev.target.result;
                updateFormImagePreview(pendingImageData);
            };
            reader.readAsDataURL(file);
        });
    }

    if (detailImageInput) {
        detailImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                detailPendingImageData = ev.target.result;
                updateDetailImagePreview(detailPendingImageData);
            };
            reader.readAsDataURL(file);
        });
    }

    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            document.querySelectorAll('.main-nav .nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            currentCategory = this.dataset.category || '';

            // Resetea el filtro secundario para evitar conflictos y que no salga nada
            if (filterMaterial) filterMaterial.value = '';
            syncCategoryMenu();

            currentPage = 1;
            updateDisplay();
        });
    });



    function openDetailModal(mueble) {
        detailIdInput.value = mueble.id;
        detailNombreInput.value = mueble.nombre || '';
        detailDescripcionInput.value = mueble.descripcion || '';
        detailMaterialInput.value = mueble.material || '';
        detailPrecioInput.value = mueble.precio;
        detailStockInput.value = mueble.stock;
        const materialText = mueble.material && mueble.material.trim() !== '' ? mueble.material : 'Sin material';
        detailSubtitle.textContent = 'ID #' + mueble.id + ' • ' + materialText;
        detailPendingImageData = mueble.imagen || null;
        updateDetailImagePreview(detailPendingImageData);
        if (detailImageInput) {
            detailImageInput.value = '';
        }
        const isBuyer = currentMode !== 'admin';
        detailNombreInput.disabled = isBuyer;
        detailDescripcionInput.disabled = isBuyer;
        detailMaterialInput.disabled = isBuyer;
        detailPrecioInput.disabled = isBuyer;
        detailStockInput.disabled = isBuyer;
        if (detailImageInput) {
            detailImageInput.disabled = isBuyer;
        }
        const detailSaveBtn = detailForm.querySelector('button[type="submit"]');
        if (detailSaveBtn) {
            detailSaveBtn.style.display = isBuyer ? 'none' : 'inline-flex';
        }
        detailOverlay.classList.remove('hidden');
    }

    function closeDetailModal() {
        detailOverlay.classList.add('hidden');
        detailForm.reset();
        detailPendingImageData = null;
        updateDetailImagePreview(null);
    }

    if (detailCloseBtn && detailCancelBtn && detailOverlay) {
        detailCloseBtn.addEventListener('click', closeDetailModal);
        detailCancelBtn.addEventListener('click', closeDetailModal);
        detailOverlay.addEventListener('click', (e) => {
            if (e.target === detailOverlay) {
                closeDetailModal();
            }
        });
    }


    function renderCategoryMenu() {
        if (!categoryMenu) return;
        const materials = Array.from(
            new Set(allMuebles.map((m) => m.material).filter(Boolean))
        ).sort();
        categoryMenu.innerHTML = "";
        const allButton = document.createElement("button");
        allButton.textContent = "Todos";
        allButton.className = "category-pill";
        allButton.dataset.material = "";
        categoryMenu.appendChild(allButton);
        materials.forEach((mat) => {
            const btn = document.createElement("button");
            btn.textContent = mat;
            btn.className = "category-pill";
            btn.dataset.material = mat;
            categoryMenu.appendChild(btn);
        });
        syncCategoryMenu();
    }

    function syncCategoryMenu() {
        if (!categoryMenu) return;
        const activeMaterial = filterMaterial.value || "";
        const pills = categoryMenu.querySelectorAll(".category-pill");
        pills.forEach((pill) => {
            const mat = pill.dataset.material || "";
            if (mat === activeMaterial) {
                pill.classList.add("active");
            } else {
                pill.classList.remove("active");
            }
        });
    }
    async function fetchMuebles() {
        try {
            const response = await fetch(apiUrl, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (!response.ok) {
                throw new Error('Error al cargar los muebles. Estado: ' + response.status);
            }
            allMuebles = await response.json();
            populateMaterialFilter();
            renderCategoryMenu();
            updateDisplay();
        } catch (error) {
            console.error(error);
            grid.innerHTML = '<p style="text-align:center; color:#ef4444; padding:1rem;">No se pudieron cargar los datos. Verifica que la API esté activa.</p>';
        }
    }

    function getFilteredMuebles() {
        const searchTerm = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase();
        const materialValue = filterMaterial && filterMaterial.value ? filterMaterial.value : '';

        return allMuebles.filter((m) => {
            const matchesSearch = 
                (m.nombre && m.nombre.toLowerCase().includes(searchTerm)) ||
                (m.descripcion && m.descripcion.toLowerCase().includes(searchTerm));
            const matchesMaterial = !materialValue || m.material === materialValue;

            const matchesCategory = !currentCategory || m.material === currentCategory;

            return matchesSearch && matchesMaterial && matchesCategory;
        });
    }

    function updateDisplay() {
        const filtered = getFilteredMuebles();
        const totalItems = filtered.length;
        if (catalogCount) {
            catalogCount.textContent = totalItems + (totalItems === 1 ? ' producto encontrado' : ' productos encontrados');
        }

        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = filtered.slice(start, end);

        renderGrid(pageItems);
        renderPaginationControls(totalItems, totalPages);
        syncCategoryMenu();
    }

    function renderGrid(muebles) {
        grid.innerHTML = '';
        if (!muebles.length) {
            grid.innerHTML = '<p style="font-size:0.9rem; color:#6b7280;">No se encontraron productos con esos criterios.</p>';
            return;
        }
        muebles.forEach((mueble, index) => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.dataset.id = mueble.id;

            const imgData = mueble.imagen;

            const stockValue = Number(mueble.stock);
            let stockClass = '';
            if (stockValue === 0) {
                stockClass = 'out';
            } else if (stockValue > 0 && stockValue <= 5) {
                stockClass = 'low';
            }

            const isAdmin = currentMode === 'admin';
            const footerHtml = isAdmin
                ? `
                    <button class="btn-small btn-ghost" data-role="detail" type="button">
                        <span>👁️</span>
                        <span>Ver detalle</span>
                    </button>
                    <button class="btn-small btn-edit" data-role="edit" type="button">
                        <span>✏️</span>
                        <span>Editar</span>
                    </button>
                    <button class="btn-small btn-delete" data-role="delete" type="button">
                        <span>🗑️</span>
                        <span>Eliminar</span>
                    </button>
                `
                : `
                    <button class="btn-small btn-ghost" data-role="detail" type="button">
                        <span>👁️</span>
                        <span>Ver detalle</span>
                    </button>
                    <button class="btn-small btn-small-primary" data-role="add-cart" type="button">
                        <span>👜</span>
                        <span>Agregar al carrito</span>
                    </button>
                `;

            card.innerHTML = `
                <div class="product-image-wrapper">
                    ${imgData
                        ? `<img src="${imgData}" alt="Imagen del producto ${mueble.nombre || ''}">`
                        : `<span class="product-image-placeholder">${getMuebleIcon(mueble.material || '')}</span>`}
                </div>
                <div class="product-body">
                    <h3 class="product-name">${mueble.nombre || 'Sin nombre'}</h3>
                    <p class="product-material">${mueble.material || 'Material no especificado'}</p>
                    <p class="product-price">${formatPrice(mueble.precio)}</p>
                    <p class="product-stock ${stockClass}">${stockText(stockValue)}</p>
                </div>
                <div class="product-footer">
                    ${footerHtml}
                </div>
            `;
            grid.appendChild(card);
            card.classList.add('card-appear');
            card.style.animationDelay = (index * 0.04) + 's';
        });
    }

    function stockText(value) {
        const n = Number(value);
        if (Number.isNaN(n)) return 'Stock no disponible';
        if (n === 0) return 'Sin stock';
        if (n <= 5) return 'Bajo stock: ' + n + ' pzas';
        return 'En stock: ' + n + ' pzas';
    }

    function renderPaginationControls(totalItems, totalPages) {
        if (!pageInfo) return;
        pageInfo.textContent = 'Página ' + currentPage + ' de ' + totalPages;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    function populateMaterialFilter() {
        const materials = Array.from(
            new Set(allMuebles.map((m) => m.material).filter(Boolean))
        ).sort();
        filterMaterial.innerHTML = '<option value="">Todos</option>';
        materials.forEach((mat) => {
            const opt = document.createElement('option');
            opt.value = mat;
            opt.textContent = mat;
            filterMaterial.appendChild(opt);
        });
    }

    function resetForm() {
        form.reset();
        muebleIdInput.value = '';
        cancelBtn.style.display = 'none';
        const submitTextSpan = form.querySelector('button[type="submit"] .btn-text');
        if (submitTextSpan) submitTextSpan.textContent = 'Guardar';
        pendingImageData = null;
        if (muebleImageInput) {
            muebleImageInput.value = '';
        }
        updateFormImagePreview(null);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            nombre: nombreInput.value,
            descripcion: descripcionInput.value,
            material: materialInput.value,
            precio: parseFloat(precioInput.value),
            stock: parseInt(stockInput.value, 10),
            imagen: pendingImageData
        };

        const id = muebleIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? apiUrl + '/' + id : apiUrl;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Error al guardar el mueble');
            }
            resetForm();
            await fetchMuebles();
        } catch (error) {
            console.error(error);
        }
    });

    if (detailForm) {
        detailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = detailIdInput.value;
            if (!id) return;
            const data = {
                nombre: detailNombreInput.value,
                descripcion: detailDescripcionInput.value,
                material: detailMaterialInput.value,
                precio: parseFloat(detailPrecioInput.value),
                stock: parseInt(detailStockInput.value, 10),
                imagen: detailPendingImageData
            };
            try {
                const response = await fetch(apiUrl + '/' + id, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error('Error al actualizar el mueble');
                }
                closeDetailModal();
                await fetchMuebles();
            } catch (error) {
                console.error(error);
            }
        });
    }

    cancelBtn.addEventListener('click', () => {
        resetForm();
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            updateDisplay();
        });
    }

    if (filterMaterial) {
        filterMaterial.addEventListener('change', () => {
            currentPage = 1;
            updateDisplay();
            syncCategoryMenu();
        });
    }

    if (categoryMenu) {
        categoryMenu.addEventListener('click', (e) => {
            const pill = e.target.closest('.category-pill');
            if (!pill) return;
            const materialValue = pill.dataset.material || '';
            filterMaterial.value = materialValue;
            currentPage = 1;
            updateDisplay();
            syncCategoryMenu();
        });
    }

    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value, 10) || 8;
            currentPage = 1;
            updateDisplay();
        });
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage -= 1;
            updateDisplay();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        currentPage += 1;
        updateDisplay();
    });

    grid.addEventListener('click', async (e) => {
        const roleButton = e.target.closest('[data-role]');
        const card = e.target.closest('.product-card');
        if (!card) return;
        const id = card.dataset.id;
        if (!id) return;

        if (roleButton) {
            const role = roleButton.getAttribute('data-role');
            if (role === 'detail') {
                const mueble = allMuebles.find((m) => String(m.id) === String(id));
                if (mueble) openDetailModal(mueble);
                return;
            }
            if (role === 'add-cart') {
                const mueble = allMuebles.find((m) => String(m.id) === String(id));
                if (mueble) addToCart(mueble);
                return;
            }
            if (role === 'edit') {
                const mueble = allMuebles.find((m) => String(m.id) === String(id));
                if (!mueble) return;
                muebleIdInput.value = mueble.id;
                nombreInput.value = mueble.nombre || '';
                descripcionInput.value = mueble.descripcion || '';
                materialInput.value = mueble.material || '';
                precioInput.value = mueble.precio;
                stockInput.value = mueble.stock;
                const submitTextSpan = form.querySelector('button[type="submit"] .btn-text');
                if (submitTextSpan) submitTextSpan.textContent = 'Actualizar';
                cancelBtn.style.display = 'inline-flex';
                pendingImageData = mueble.imagen || null;
                updateFormImagePreview(pendingImageData);
                if (muebleImageInput) {
                    muebleImageInput.value = '';
                }
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            if (role === 'delete') {
                if (!confirm('¿Seguro que deseas eliminar este mueble?')) {
                    return;
                }
                try {
                    const response = await fetch(apiUrl + '/' + id, {
                        method: 'DELETE',
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    });
                    if (!response.ok) {
                        throw new Error('Error al eliminar el mueble');
                    }
                    await fetchMuebles();
                } catch (error) {
                    console.error(error);
                }
                return;
            }
        } else {
            const mueble = allMuebles.find((m) => String(m.id) === String(id));
            if (mueble) {
                openDetailModal(mueble);
            }
        }
    });

    fetchMuebles();
});
