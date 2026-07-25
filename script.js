// ========================================== 
// E&F STORE ONLINE - JAVASCRIPT AMÉLIORÉ
// ========================================== 

// 1. HAMBURGER MENU TOGGLE 
const hamburgerBtn = document.getElementById('hamburger-btn'); 
const navMenu = document.getElementById('nav-menu'); 
const menuItems = document.querySelectorAll('.menu-item'); 

hamburgerBtn.addEventListener('click', () => { 
  hamburgerBtn.classList.toggle('active'); 
  navMenu.classList.toggle('active'); 
}); 

menuItems.forEach(item => { 
  item.addEventListener('click', () => { 
    hamburgerBtn.classList.remove('active'); 
    navMenu.classList.remove('active'); 
  }); 
}); 

// 2. STICKY HEADER & BACK TO TOP SOU SCROLL
const header = document.getElementById('header');
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('header-scrolled');
    backToTopBtn.classList.add('show');
  } else {
    header.classList.remove('header-scrolled');
    backToTopBtn.classList.remove('show');
  }
});

// 3. SISTÈM FILTRE AK "VOIR PLUS" 
const filterBtns = document.querySelectorAll('.filter-btn'); 
const productCards = document.querySelectorAll('.product-card'); 
const voirPlusContainer = document.getElementById('voir-plus-container'); 
const btnVoirPlus = document.getElementById('btn-voir-plus'); 
let activeCategory = 'tout'; 
const LIMIT_INITIAL = 10; 

function updateGallery(category, showAll = false) { 
  activeCategory = category; 
  let count = 0; 
  
  productCards.forEach(card => { 
    const cardCategory = card.getAttribute('data-category'); 
    if (category === 'tout' || category === cardCategory) { 
      count++; 
      if (showAll || count <= LIMIT_INITIAL) { 
        card.style.display = 'block';
      } else { 
        card.style.display = 'none';
      } 
    } else {
      card.style.display = 'none';
    }
  }); 

  voirPlusContainer.style.display = (count > LIMIT_INITIAL && !showAll) ? 'block' : 'none'; 
} 

filterBtns.forEach(btn => { 
  btn.addEventListener('click', () => { 
    filterBtns.forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); 
    updateGallery(btn.getAttribute('data-filter'), false); 
  }); 
}); 

btnVoirPlus.addEventListener('click', () => updateGallery(activeCategory, true)); 
updateGallery('tout'); 

// 4. SEARCH BAR (BOUTON RECHÈCH)
const searchBar = document.getElementById('search-bar');
searchBar.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  
  // Retire filtè kategori a tanporèman lè l ap chache
  filterBtns.forEach(b => b.classList.remove('active')); 
  
  productCards.forEach(card => {
    const title = card.querySelector('h3').innerText.toLowerCase();
    if (title.includes(term)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

// 5. NOTIFIKASYON TOAST
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  
  container.appendChild(toast);
  
  // Efase l apre 3 segonn
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// 6. QUICK VIEW MODAL (KOUTJE RAPID)
const quickViewModal = document.getElementById('quick-view-modal');
let qvProduitActuel = {};

window.ouvrirQuickView = function(nom, prix, img) {
  document.getElementById('qv-title').innerText = nom;
  document.getElementById('qv-price').innerText = prix;
  document.getElementById('qv-img').src = img;
  
  qvProduitActuel = { nom, prix };
  quickViewModal.classList.add('show');
}

window.toggleQuickView = function() {
  quickViewModal.classList.remove('show');
}

window.ajouterDepuisQV = function() {
  const sizeOption = document.getElementById('qv-size').value;
  let nomFinal = qvProduitActuel.nom;
  
  if(sizeOption !== "") {
    nomFinal += ` (Taille: ${sizeOption})`;
  }
  
  commander(nomFinal, qvProduitActuel.prix);
  toggleQuickView();
}


// 7. SISTÈM PANYE AK LOCALSTORAGE & KANTITE
let panier = JSON.parse(localStorage.getItem('panierEF')) || []; 
const cartModal = document.getElementById('cart-modal'); 
const cartItemsContainer = document.getElementById('cart-items'); 
const cartCountUI = document.getElementById('cart-count'); 
const cartCheckoutSection = document.getElementById('cart-checkout-section'); 
const cartTotalPriceUI = document.getElementById('cart-total-price'); 

// Rele fonksyon an yon fwa pou l chaje done ki te nan memwa a
mettreAJourPanier();

function parsePriceToNumber(priceString) { 
  return parseInt(priceString.replace(/,/g, '').replace(' HTG', '').trim()); 
} 

window.commander = function(nomProduit, prixStr) { 
  const prixNum = parsePriceToNumber(prixStr); 
  
  // Tcheke si pwodwi a deja nan panye a
  let existingItemIndex = panier.findIndex(item => item.nom === nomProduit);
  
  if (existingItemIndex !== -1) {
    panier[existingItemIndex].quantite += 1;
  } else {
    panier.push({ nom: nomProduit, prixText: prixStr, prixValue: prixNum, quantite: 1 }); 
  }
  
  sauvegarderPanier();
  mettreAJourPanier(); 
  
  // Animasyon sou ti panye flote a
  cartCountUI.style.transform = "scale(1.5)"; 
  setTimeout(() => cartCountUI.style.transform = "scale(1)", 300); 
  
  // Afiche mesaj Toast la
  showToast(`${nomProduit} ajouté au panier`);
}; 

function sauvegarderPanier() {
  localStorage.setItem('panierEF', JSON.stringify(panier));
}

window.toggleCart = function() { 
  cartModal.classList.toggle('show'); 
} 

window.supprimerDuPanier = function(index) { 
  panier.splice(index, 1); 
  sauvegarderPanier();
  mettreAJourPanier(); 
} 

function mettreAJourPanier() { 
  if (!cartCountUI || !cartItemsContainer) return; 
  
  // Kalkile kantite total atik yo
  let totalItems = panier.reduce((sum, item) => sum + item.quantite, 0);
  cartCountUI.innerText = totalItems; 
  
  if (panier.length === 0) { 
    cartItemsContainer.innerHTML = '<p class="empty-cart">Votre panier est vide pour le moment.</p>'; 
    cartCheckoutSection.style.display = 'none'; 
    return; 
  } 
  
  let htmlPanier = ''; 
  let total = 0; 
  
  panier.forEach((item, index) => { 
    let sousTotal = item.prixValue * item.quantite;
    total += sousTotal; 
    
    // Si kantite a > 1, nou make "(x2)" ak nouvo pri a
    let affichagePrix = item.quantite > 1 ? `${item.prixText} (x${item.quantite}) = ${sousTotal.toLocaleString()} HTG` : item.prixText;

    htmlPanier += `
      <div class="cart-item">
        <div>
          <h4>${item.nom} ${item.quantite > 1 ? `<span style="color:var(--accent)">(x${item.quantite})</span>` : ''}</h4>
          <span class="price">${affichagePrix}</span>
        </div>
        <button class="remove-btn" onclick="supprimerDuPanier(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `; 
  }); 
  
  cartItemsContainer.innerHTML = htmlPanier; 
  cartCheckoutSection.style.display = 'block'; 
  cartTotalPriceUI.innerText = total.toLocaleString() + ' HTG'; 
} 

// 8. VOYE KOMANN SOU WHATSAPP AK FÒM PÈSONALIZE
window.envoyerCommandeWhatsApp = function() { 
  if (panier.length === 0) return; 
  
  const nomClient = document.getElementById('client-name').value.trim();
  const adresseClient = document.getElementById('client-address').value.trim();
  
  if (nomClient === "" || adresseClient === "") {
    alert("Veuillez entrer votre nom et votre adresse de livraison pour continuer.");
    return;
  }

  const numeroWhatsApp = "50946829386"; 
  
  let message = `Bonjour *E&F Store Online*, je suis *${nomClient}*.\nJe souhaite être livré à : *${adresseClient}*.\n\nVoici ma commande :\n\n`; 
  let total = 0; 
  
  panier.forEach((item, index) => { 
    let sousTotal = item.prixValue * item.quantite;
    total += sousTotal; 
    let qteText = item.quantite > 1 ? ` (x${item.quantite})` : '';
    message += `📦 ${index + 1}. *${item.nom}*${qteText} - ${sousTotal.toLocaleString()} HTG\n`; 
  }); 
  
  message += `\n━━━━━━━━━━━━━━━\n`; 
  message += `💰 *TOTAL À PAYER : ${total.toLocaleString()} HTG*\n`; 
  message += `━━━━━━━━━━━━━━━\n\n`; 
  message += `Merci de m'indiquer comment procéder au paiement.`; 
  
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`; 
  window.open(url, "_blank"); 
  
  // Efase panye a lè komann nan fin fèt
  panier = []; 
  sauvegarderPanier();
  mettreAJourPanier(); 
  toggleCart(); 
}
