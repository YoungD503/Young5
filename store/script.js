// 1. Data Structure - Ensure images match your file names exactly
const products = [
    { id: 1, name: "The 'Peace' Hoodie", verse: "Philippians 4:7", price: 65, image: "00.jpg", stripeLink: "#" },
    { id: 2, name: "The 'Strength' Hoodie", verse: "Isaiah 40:31", price: 65, image: "02.jpg", stripeLink: "#" },
    { id: 3, name: "The 'Light' Hoodie", verse: "Matthew 5:14", price: 65, image: "03.jpg", stripeLink: "#" },
    { id: 4, name: "The 'Love' Hoodie", verse: "1 Corinthians 13:4", price: 65, image: "04.jpg", stripeLink: "#" }
];

// 2. State Management
let cart = JSON.parse(localStorage.getItem('brandCart')) || [];
let selectedSize = null; 

// 3. UI Selectors
const container = document.getElementById('product-container');
const cartCountElement = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPriceElement = document.getElementById('cart-total-price');

// 4. Toggle Cart Visibility
function toggleCart() {
    if (!cartSidebar || !cartOverlay) return;
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    
    if (cartSidebar.classList.contains('active')) {
        renderCart(); 
    }
}

// 5. Render Grid (Home Page)
function renderProducts() {
    if(!container) return;
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
            </a>
            <h3>${product.name}</h3>
            <p class="verse-highlight">${product.verse}</p>
            <p style="font-weight: bold;">$${product.price.toFixed(2)}</p>
            <a href="product.html?id=${product.id}" class="btn" style="margin-top: 15px; padding: 0.6rem 1rem; font-size: 0.8rem;">View Details</a>
        </div>
    `).join('');
}

// 6. Size Selection Logic
function selectSize(size) {
    selectedSize = size;
    const buttons = document.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        btn.classList.remove('selected'); 
        if (btn.innerText === size) btn.classList.add('selected');
    });
}

// 7. Add to Cart Logic
function addToCart(productId) {
    const sizeButtonsExist = document.querySelector('.size-buttons');
    
    // Fix: Ensure a size is always selected, even if it's a default "M"
    if (sizeButtonsExist && !selectedSize) {
        alert("Please select a size (S, M, L, or XL) before adding to cart.");
        return;
    }

    const product = products.find(p => p.id === productId);
    const finalSize = selectedSize || "M"; // Default to M if no selector exists
    
    const cartId = `${productId}-${finalSize}`;
    const existingItem = cart.find(item => item.cartId === cartId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, cartId: cartId, size: finalSize, quantity: 1 });
    }

    saveCart();
    updateNavCount();
    renderCart(); 
    
    // Automatically open the cart so the user sees it was added
    if (!cartSidebar.classList.contains('active')) {
        toggleCart();
    }
    
    // Reset selection for UI
    selectedSize = null;
    const buttons = document.querySelectorAll('.size-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
}

// 8. Render Items Inside the Sidebar
function renderCart() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="padding:40px; text-align:center; color: #888;">Your cart is empty.</p>`;
        cartTotalPriceElement.innerText = `$0.00`;
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="item-specs">Size: ${item.size}</p>
                    
                    <div class="qty-controls">
                        <button onclick="updateQuantity('${item.cartId}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.cartId}', 1)">+</button>
                    </div>
                    
                    <p class="cart-item-price">$${itemTotal.toFixed(2)}</p>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.cartId}')">&times;</button>
            </div>
        `;
    }).join('');

    cartTotalPriceElement.innerText = `$${total.toFixed(2)}`;
}

// Fix: Improved filtering logic to ensure ID matching works perfectly
function removeFromCart(cartId) {
    cart = cart.filter(item => String(item.cartId) !== String(cartId));
    saveCart();
    updateNavCount();
    renderCart();
}

function updateNavCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    // This updates every element with the class 'cart-count-val'
    const countElements = document.querySelectorAll('.cart-count-val');
    countElements.forEach(el => {
        el.innerText = totalItems;
    });
}

function saveCart() {
    localStorage.setItem('brandCart', JSON.stringify(cart));
}

// 9. Checkout Redirect
async function handleCheckout() {
    if (cart.length === 0) {
        alert("Add items to your cart first!");
        return;
    }

    try {
        const response = await fetch("https://api.youngdesert.com/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ items: cart })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url; // 🔥 Redirect to Stripe
        } else {
            alert("Checkout error.");
        }

    } catch (error) {
        console.error("Checkout failed:", error);
        alert("Something went wrong.");
    }
}

// 10. Product Page Loader
function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    if (!id) return;

    const item = products.find(p => p.id === id);
    const titleElem = document.getElementById('product-title');

    if (item && titleElem) {
        titleElem.innerText = item.name;
        document.getElementById('product-verse').innerText = item.verse;
        document.getElementById('product-price').innerText = `$${item.price.toFixed(2)}`;
        document.getElementById('main-product-img').src = item.image;
        document.getElementById('main-product-img').alt = item.name;
        document.getElementById('add-to-cart-btn').onclick = () => addToCart(item.id);
    }
}


function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('active');
    
    // Prevent scrolling when menu is open
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}


function openCartFromMenu() {
    toggleMenu(); // Close the mobile menu
    setTimeout(() => {
        toggleCart(); // Open the cart sidebar
    }, 300); // Small delay for a smoother transition
}



function updateQuantity(cartId, change) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity += change;

        // If quantity goes below 1, remove the item entirely
        if (item.quantity <= 0) {
            removeFromCart(cartId);
        } else {
            saveCart();
            updateNavCount();
            renderCart();
        }
    }
}

function initNewsletter() {
    const overlay = document.getElementById('newsletter-overlay');
    const closeBtn = document.getElementById('close-newsletter');
    const form = document.getElementById('newsletter-form');

    if (!overlay || !closeBtn || !form) return;

    // Don't show if already shown this session
    if (sessionStorage.getItem('newsletter_shown')) return;

    // Show after 5 seconds
    setTimeout(() => {
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
    }, 5000);

    const dismissModal = () => {
        overlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        sessionStorage.setItem('newsletter_shown', 'true');
    };

    closeBtn.addEventListener('click', dismissModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) dismissModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button');
        const email = form.querySelector('input').value;

        btn.innerText = "JOINING...";
        btn.disabled = true;

        const formData = new FormData();
        formData.append("access_key", "8c2f6208-ecac-4ce7-bc3c-02d5c8493e97");
        formData.append("email", email);
        formData.append("subject", "Young Desert New Subscriber");

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                form.innerHTML =
                    "<p style='font-weight: bold; font-size: 1.2rem; color: #000;'>WELCOME TO THE FAMILY. CHECK YOUR INBOX.</p>";

                setTimeout(dismissModal, 3000);
            } else {
                throw new Error();
            }
        } catch (error) {
            btn.innerText = "ERROR. TRY AGAIN?";
            btn.disabled = false;
        }
    });
}






    document.addEventListener('DOMContentLoaded', initNewsletter);
// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateNavCount();
    loadProductDetails();
    renderCart(); 
});



