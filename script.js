// ========================================== 
// E&F STORE ONLINE - KÒD JS KONPLÈ PRO 
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

// 2. SISTÈM FILTRE AK "VOIR PLUS" 
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
        card.classList.remove('hide-card'); 
        card.classList.add('show-card'); 
        card.style.display = 'block';
      } else { 
        card.classList.add('hide-card'); 
        card.classList.remove('show-card'); 
        card.style.display = 'none';
      } 
    } else {
      card.classList.add('hide-card'); 
      card.classList.remove('show-card'); 
      card.style.display = 'none';
    }
  }); 

  if (count > LIMIT_INITIAL && !showAll) { 
    voirPlusContainer.style.display = 'block'; 
  } else { 
    voirPlusContainer.style.display = 'none'; 
  } 
} 

filterBtns.forEach(btn => { 
  btn.addEventListener('click', () => { 
    filterBtns.forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); 
    const filter = btn.getAttribute('data-filter'); 
    updateGallery(filter, false); 
  }); 
}); 

btnVoirPlus.addEventListener('click', () => { 
  updateGallery(activeCategory, true); 
}); 

updateGallery('tout'); 


// 3. KÒMANTÈ DINAMIK 
const commentForm = document.getElementById('comment-form'); 
const commentsList = document.getElementById('comments-list'); 

commentForm.addEventListener('submit', (e) => { 
  e.preventDefault(); 
  const nameInput = document.getElementById('comment-name').value; 
  const textInput = document.getElementById('comment-text').value; 
  const newComment = document.createElement('div'); 
  newComment.classList.add('comment-card', 'show-card'); 
  
  newComment.innerHTML = `
    <div class="comment-header">
      <strong>${nameInput}</strong>
      <span class="comment-date">À l'instant</span>
    </div>
    <p>${textInput}</p>
  `; 
  
  commentsList.prepend(newComment); 
  commentForm.reset(); 
}); 


// 4. GESTION PRELOADER (Ekran Chajman) 
window.addEventListener('load', () => { 
  const preloader = document.getElementById('preloader'); 
  if (preloader) { 
    setTimeout(() => { 
      preloader.classList.add('fade-out'); 
    }, 1800); 
  } 
}); 


// 5. GESTION MODAL GID TAY 
const guideModal = document.getElementById('guide-modal'); 
function toggleGuideTailles() { 
  if (guideModal) { 
    guideModal.classList.toggle('show'); 
  } 
} 


// 6. SISTÈM PANYE ACHA INTELLIGENT (AK KOREKSYON WHATSAPP LA)
let panier = []; 
const cartModal = document.getElementById('cart-modal'); 
const cartItemsContainer = document.getElementById('cart-items'); 
const cartCountUI = document.getElementById('cart-count'); 
const cartTotalSection = document.getElementById('cart-total-section'); 
const cartTotalPriceUI = document.getElementById('cart-total-price'); 
const btnValider = document.getElementById('btn-valider-commande'); 

function parsePriceToNumber(priceString) { 
  return parseInt(priceString.replace(/,/g, '').replace(' HTG', '').trim()); 
} 

window.commander = function(nomProduit, prixStr) { 
  const prixNum = parsePriceToNumber(prixStr); 
  panier.push({ nom: nomProduit, prixText: prixStr, prixValue: prixNum }); 
  
  if (cartCountUI) { 
    cartCountUI.style.transform = "scale(1.5)"; 
    setTimeout(() => cartCountUI.style.transform = "scale(1)", 300); 
  } 
  mettreAJourPanier(); 
}; 

function toggleCart() { 
  if (cartModal) { 
    cartModal.classList.toggle('show'); 
  } 
} 

window.supprimerDuPanier = function(index) { 
  panier.splice(index, 1); 
  mettreAJourPanier(); 
} 

function mettreAJourPanier() { 
  if (!cartCountUI || !cartItemsContainer) return; 
  cartCountUI.innerText = panier.length; 
  
  if (panier.length === 0) { 
    cartItemsContainer.innerHTML = '<p class="empty-cart">Votre panier est vide pour le moment.</p>'; 
    if (cartTotalSection) cartTotalSection.style.display = 'none'; 
    if (btnValider) btnValider.style.display = 'none'; 
    return; 
  } 
  
  let htmlPanier = ''; 
  let total = 0; 
  
  panier.forEach((item, index) => { 
    total += item.prixValue; 
    htmlPanier += `
      <div class="cart-item">
        <div>
          <h4>${item.nom}</h4>
          <span class="price">${item.prixText}</span>
        </div>
        <button class="remove-btn" onclick="supprimerDuPanier(${index})"><i class="fas fa-trash"></i></button>
      </div>
    `; 
  }); 
  
  cartItemsContainer.innerHTML = htmlPanier; 
  if (cartTotalSection) cartTotalSection.style.display = 'block'; 
  if (btnValider) btnValider.style.display = 'block'; 
  if (cartTotalPriceUI) cartTotalPriceUI.innerText = total.toLocaleString() + ' HTG'; 
} 

function envoyerCommandeWhatsApp() { 
  if (panier.length === 0) return; 
  const numeroWhatsApp = "50946067866"; 
  
  let message = `Bonjour *E&F Store Online*, je souhaite valider ma commande :\n\n`; 
  let total = 0; 
  
  panier.forEach((item, index) => { 
    total += item.prixValue; 
    message += `📦 ${index + 1}. *${item.nom}* - ${item.prixText}\n`; 
  }); 
  
  message += `\n━━━━━━━━━━━━━━━\n`; 
  message += `💰 *TOTAL À PAYER : ${total.toLocaleString()} HTG*\n`; 
  message += `━━━━━━━━━━━━━━━\n\n`; 
  message += `Merci de m'indiquer les modalités de livraison et de paiement.`; 
  
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`; 
  window.open(url, "_blank"); 
  
  panier = []; 
  mettreAJourPanier(); 
  toggleCart(); 
}
