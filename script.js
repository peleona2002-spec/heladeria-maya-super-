// Configuración básica e interacciones para Heladería Arcoíris

document.addEventListener('DOMContentLoaded', () => {

    // --- Menú Móvil ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle menu
    mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Cerrar menú al hacer click en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // --- Efecto Header al hacer scroll ---
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link on scroll
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Filtrado de Productos ---
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover clase active de todos los botones
            filterBtns.forEach(b => b.classList.remove('active'));
            // Añadir clase active al botón clickeado
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const grids = document.querySelectorAll('.products-grid');

            grids.forEach(grid => {
                const cardsInGrid = grid.querySelectorAll('.product-card');
                let hasVisibleCards = false;

                cardsInGrid.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (filterValue === 'all' || cardCat === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1) translateY(0)';
                        }, 50);
                        hasVisibleCards = true;
                    } else {
                        card.style.display = 'none';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                    }
                });

                // Mostrar/ocultar el grid y su título correspondiente (elemento anterior)
                const title = grid.previousElementSibling;
                if (hasVisibleCards) {
                    grid.style.display = 'flex';
                    if (title && title.classList.contains('category-title')) {
                        title.style.display = 'block';
                    }
                } else {
                    grid.style.display = 'none';
                    if (title && title.classList.contains('category-title')) {
                        title.style.display = 'none';
                    }
                }
            });
        });
    });

    // --- Lógica del Carrito de Compras ---
    let cart = [];
    const cartList = document.getElementById('carrito');
    const totalElement = document.getElementById('total');
    const cartCountElement = document.getElementById('cart-count');
    const cartWidget = document.getElementById('cart-widget');
    const cartHeader = document.getElementById('cart-header');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Alternar visibilidad del carrito
    cartHeader.addEventListener('click', () => {
        cartWidget.classList.toggle('minimized');
    });

    function updateCart() {
        cartList.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartList.innerHTML = '<li class="empty-cart">El carrito está vacío</li>';
            cartWidget.classList.add('minimized');
        } else {
            cart.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-qty">x${item.qty}</span>
                    </div>
                    <div class="cart-item-actions">
                        <span class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-CO')}</span>
                        <button class="remove-item" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                cartList.appendChild(li);
                total += item.price * item.qty;
                count += item.qty;
            });
        }

        totalElement.textContent = total.toLocaleString('es-CO');
        if (cartCountElement) cartCountElement.textContent = count;

        // Añadir eventos a los botones de eliminar
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que el clic cierre el carrito
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCart();
            });
        });

        // Actualizar mensaje de WhatsApp
        let message = "Hola, me gustaría hacer el siguiente pedido:%0A";
        cart.forEach(item => {
            message += `- ${item.qty}x ${item.name}: $${(item.price * item.qty).toLocaleString('es-CO')}%0A`;
        });
        message += `%0A*Total: $${total.toLocaleString('es-CO')}*`;
        checkoutBtn.href = `https://wa.me/573134292831?text=${message}`;
    }

    // --- Interacción botón añadir ---
    const addBtns = document.querySelectorAll('.btn-add');
    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const productName = card.querySelector('h3').textContent;
            const priceText = card.querySelector('.price').textContent;
            const price = parseInt(priceText.replace(/\D/g, ''));

            // Añadir al carrito
            const existingItem = cart.find(item => item.name === productName);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({ name: productName, price: price, qty: 1 });
            }

            updateCart();
            cartWidget.classList.remove('minimized'); // Abrir el carrito al añadir

            // Animación visual
            let icon = btn.querySelector('i');
            if (!icon) icon = e.target; // fallback si el clic fue en el icono
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-check');
            btn.style.backgroundColor = 'var(--color-pink)'; // Cambiar a rosado

            setTimeout(() => {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-plus');
                btn.style.backgroundColor = ''; // Volver al color original
            }, 2000);
        });
    });

    // --- Carrusel de Imágenes de Inicio (Slideshow) ---
    const fotoElement = document.getElementById("foto");
    if (fotoElement) {
        let imagenes = [
            "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80"
        ];
        let idx = 0;

        setInterval(() => {
            idx = (idx + 1) % imagenes.length;
            fotoElement.style.opacity = '0';
            setTimeout(() => {
                fotoElement.src = imagenes[idx];
                fotoElement.style.opacity = '1';
            }, 300); // Transición suave de opacidad
        }, 3000); // Cambia cada 3 segundos
    }
});
