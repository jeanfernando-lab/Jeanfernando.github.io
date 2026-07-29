// DONE NAN MEMWA A
let estok = JSON.parse(localStorage.getItem('estokData')) || [];
let istorikVant = JSON.parse(localStorage.getItem('vantData')) || [];
let lisKliyan = JSON.parse(localStorage.getItem('kliyanData')) || [];
let panyen = [];
let role = null;
let kategoriAktuel = 'Tout';
let pwodwiKouranIndex = null;
let html5QrcodeScanner = null;

// KONEKSYON
function konekte() {
    let user = document.getElementById('username').value.toLowerCase();
    let pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') role = 'admin';
    else if (user === 'kesye' && pass === 'kesye123') role = 'kesye';
    else { alert("Modpas pa bon!"); return; }

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    document.getElementById('user-display').innerHTML = `<i class="fa-solid fa-circle-user"></i> ${role.toUpperCase()}`;
    document.getElementById('admin-panel').style.display = (role === 'kesye') ? 'none' : 'block';
    
    rafrechiKliyanDropdown();
    rafrechiEkran();
    if(role === 'admin') entegreGrafik();
}

function dekonekte() { location.reload(); }

// 1. SCANNER KÒD-BA
function louvriScanner() {
    document.getElementById('modal-scanner').style.display = 'flex';
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render((decodedText) => {
        femenScanner();
        let index = estok.findIndex(p => p.barcode === decodedText);
        if(index > -1) louvriModalGwose(index);
        else alert("Kòd-Ba sa pa anrejistre nan stòk la.");
    });
}
function femenScanner() {
    if(html5QrcodeScanner) html5QrcodeScanner.clear();
    document.getElementById('modal-scanner').style.display = 'none';
}

// 2. JESYON KLIYAN AK DÈT
function louvriModalKliyan() {
    document.getElementById('modal-kliyan').style.display = 'flex';
    rafrechiTabloKliyan();
}
function ajouteKliyan() {
    let nom = document.getElementById('nom-kliyan').value;
    let tel = document.getElementById('tel-kliyan').value;
    if(!nom) return;
    lisKliyan.push({ id: Date.now(), nom, tel, det: 0 });
    localStorage.setItem('kliyanData', JSON.stringify(lisKliyan));
    document.getElementById('nom-kliyan').value = '';
    document.getElementById('tel-kliyan').value = '';
    rafrechiTabloKliyan();
    rafrechiKliyanDropdown();
}
function rafrechiTabloKliyan() {
    let tbody = document.getElementById('kliyan-body');
    tbody.innerHTML = lisKliyan.map((k, i) => `
        <tr><td>${k.nom}</td><td style="color:${k.det > 0 ? 'var(--danger)' : 'var(--success)'}">${k.det} HTG</td>
        <td><button class="btn btn-warning btn-sm" onclick="peyeDet(${i})">Peye</button></td></tr>
    `).join('');
}
function rafrechiKliyanDropdown() {
    let sel = document.getElementById('select-kliyan');
    sel.innerHTML = '<option value="">Kliyan Ordinar (Cash)</option>' + lisKliyan.map(k => `<option value="${k.id}">${k.nom} (Dèt: ${k.det})</option>`).join('');
}
function peyeDet(index) {
    let kob = parseFloat(prompt("Konbyen kòb lap peye nan dèt la?"));
    if(kob > 0) {
        lisKliyan[index].det = Math.max(0, lisKliyan[index].det - kob);
        localStorage.setItem('kliyanData', JSON.stringify(lisKliyan));
        rafrechiTabloKliyan();
        rafrechiKliyanDropdown();
    }
}

// 3. GRAFIK (CHART.JS)
function entegreGrafik() {
    let ctxSales = document.getElementById('salesChart').getContext('2d');
    let ctxItems = document.getElementById('itemsChart').getContext('2d');
    
    // Nou ta itilize done reyèl istorik la pou ranpli sa, men men yon bèl egzanp
    new Chart(ctxSales, {
        type: 'line',
        data: { labels: ['Lendi', 'Madi', 'Mèkredi', 'Jedi', 'Vandredi'], datasets: [{ label: 'Vant (HTG)', data: [1500, 3000, 2000, 5000, 4500], borderColor: '#3b82f6', tension: 0.3 }] },
        options: { responsive: true, plugins: { legend: { labels: { color: 'white' } } }, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
    });
    new Chart(ctxItems, {
        type: 'doughnut',
        data: { labels: ['Tennis', 'Vètman', 'Kepi'], datasets: [{ data: [60, 30, 10], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'], borderWidth: 0 }] },
        options: { plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }
    });
}

// 4. ALÈT STÒK & RAFRECHI EKRAN
function filtreKategori(kat) { kategoriAktuel = kat; rafrechiEkran(); }
function fèRechèch() { rafrechiEkran(); }
function chanjeKategoriEstok() {
    let kat = document.getElementById('kategori-estok').value;
    document.getElementById('seksyon-tennis').style.display = kat === 'Tennis' ? 'block' : 'none';
    document.getElementById('seksyon-vetman').style.display = kat === 'Vètman' ? 'block' : 'none';
    document.getElementById('seksyon-nomal').style.display = (kat !== 'Tennis' && kat !== 'Vètman') ? 'block' : 'none';
}

function rafrechiEkran() {
    let searchTxt = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';
    let grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    let alètStok = false;

    estok.forEach((p, index) => {
        let totalKantite = p.sizes.reduce((sum, s) => sum + s.kantite, 0);
        if(totalKantite <= 2) alètStok = true; // Sistèm tcheke si gen atik ki pre fini

        if ((kategoriAktuel === 'Tout' || p.kategori === kategoriAktuel) && (p.nom.toLowerCase().includes(searchTxt) || (p.barcode && p.barcode.includes(searchTxt)))) {
            let icon = p.kategori === 'Tennis' ? 'fa-shoe-prints' : (p.kategori === 'Vètman' ? 'fa-shirt' : 'fa-hat-cowboy');
            grid.innerHTML += `
                <div class="product-card" onclick="louvriModalGwose(${index})" style="opacity: ${totalKantite > 0 ? '1' : '0.5'}">
                    <i class="fa-solid ${icon}"></i><h4>${p.nom}</h4>
                    <div class="price">${p.priVant.toLocaleString()} HTG</div>
                    <small style="color:var(--text-muted)">Stòk: ${totalKantite}</small>
                </div>`;
        }
    });

    // Badge Alèt la
    let badge = document.getElementById('low-stock-badge');
    if(alètStok) { badge.className = 'badge badge-danger'; badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Stòk Pre Fini!'; } 
    else { badge.className = 'badge badge-success'; badge.innerHTML = '<i class="fa-solid fa-check"></i> Stòk Nòmal'; }

    let panyenBody = document.getElementById('panyen-body');
    panyenBody.innerHTML = ''; let totalKès = 0;
    panyen.forEach((item, i) => {
        let kob = item.qte * item.pwodwi.priVant; totalKès += kob;
        panyenBody.innerHTML += `
            <div class="cart-item">
                <div><h5>${item.pwodwi.nom}</h5><small>Size: ${item.gwose} | Qte: ${item.qte}</small></div>
                <div style="text-align: right;"><div style="font-weight: bold;">${kob} HTG</div>
                <button class="btn btn-danger btn-sm" style="margin-top:5px;" onclick="retireNanPanyen(${i})"><i class="fa-solid fa-xmark"></i></button></div>
            </div>`;
    });
    document.getElementById('total-panyen').innerText = totalKès.toLocaleString() + ' HTG';

    let tbody = document.getElementById('estok-body');
    if (tbody) tbody.innerHTML = estok.map(p => `<tr><td><strong>${p.nom}</strong></td><td>${p.barcode || '-'}</td><td>${p.sizes.map(s => `${s.gwose}:${s.kantite}`).join(' ')}</td><td style="color:var(--success)">${p.priVant} HTG</td><td><button class="btn btn-danger btn-sm" onclick="efasePwodwi(${p.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('');

    let rantrePeye = 0, benefisFè = 0;
    istorikVant.forEach(v => { rantrePeye += v.total; benefisFè += v.pwofi; });
    if (document.getElementById('total-lavant')) {
        document.getElementById('total-lavant').innerText = rantrePeye.toLocaleString() + ' HTG';
        document.getElementById('total-benefis').innerText = benefisFè.toLocaleString() + ' HTG';
    }
}

// AJOUTE NAN STÒK
function ajouteNanEstok() {
    let nom = document.getElementById('nom-estok').value.trim();
    let barcode = document.getElementById('barcode-estok').value.trim();
    let kategori = document.getElementById('kategori-estok').value;
    let priVant = parseFloat(document.getElementById('pri-vant').value);
    let totalAcha = parseFloat(document.getElementById('total-acha').value);

    if (!nom || isNaN(priVant) || isNaN(totalAcha)) { alert("Ranpli non, pri acha ak pri vant!"); return; }

    let sizes = [];
    document.querySelectorAll(kategori === 'Tennis' ? '.qty-tennis' : (kategori === 'Vètman' ? '.qty-vetman' : '#kantite-nomal')).forEach(input => {
        let qte = parseInt(input.value);
        if (qte > 0) sizes.push({ gwose: input.getAttribute('data-num') || 'Standard', kantite: qte });
    });

    if (sizes.length === 0) { alert("Antre yon kantite!"); return; }

    estok.push({ id: Date.now(), nom, barcode, kategori, priVant, totalAcha, sizes });
    localStorage.setItem('estokData', JSON.stringify(estok));
    
    document.querySelectorAll('.form-input').forEach(i => i.value = '');
    document.querySelectorAll('.qty-tennis, .qty-vetman, #kantite-nomal').forEach(i => i.value = '');
    rafrechiEkran();
}
function efasePwodwi(id) { if (confirm("Efase nèt?")) { estok = estok.filter(p => p.id !== id); localStorage.setItem('estokData', JSON.stringify(estok)); rafrechiEkran(); } }

// PANYEN AK VALIDE VANT
function louvriModalGwose(index) {
    pwodwiKouranIndex = index; let p = estok[index];
    document.getElementById('modal-tit').innerText = p.nom;
    document.getElementById('modal-liste').innerHTML = p.sizes.map(s => `
        <div class="size-btn-row">
            <div><strong>Size: ${s.gwose}</strong> <br><small>Rete: ${s.kantite}</small></div>
            ${s.kantite > 0 ? `<button class="btn btn-primary btn-sm" onclick="ajouteNanPanyen('${s.gwose}')">Chwazi</button>` : `<span style="color:var(--danger)">Fini</span>`}
        </div>`).join('');
    document.getElementById('modal-gwose').style.display = 'flex';
}
function ajouteNanPanyen(gwose) {
    let pwodwi = estok[pwodwiKouranIndex];
    let ext = panyen.find(p => p.idPwodwi === pwodwi.id && p.gwose === gwose);
    if (ext) {
        if (ext.qte + 1 > pwodwi.sizes.find(s => s.gwose === gwose).kantite) { alert("Stòk ensifizan!"); return; }
        ext.qte += 1;
    } else panyen.push({ idPwodwi: pwodwi.id, pwodwi, gwose, qte: 1 });
    document.getElementById('modal-gwose').style.display = 'none';
    rafrechiEkran();
}
function retireNanPanyen(index) { panyen.splice(index, 1); rafrechiEkran(); }

// 5. ENPRIMANT TÈMIK (THERMAL RECEIPT)
function valideVantLan(tip) {
    if (panyen.length === 0) return;
    let clientId = document.getElementById('select-kliyan').value;
    let total = 0;
    
    let resiHTML = '';
    panyen.forEach(item => {
        let pOriginal = estok.find(e => e.id === item.idPwodwi);
        if (pOriginal) {
            let sObj = pOriginal.sizes.find(s => s.gwose === item.gwose);
            sObj.kantite -= item.qte;
            let pwofi = (pOriginal.priVant - (pOriginal.totalAcha / (pOriginal.sizes.reduce((sum, s) => sum + s.kantite, 0) || 1))) * item.qte;
            let kob = item.qte * pOriginal.priVant;
            total += kob;
            
            istorikVant.push({ dat: new Date().toLocaleString(), nom: pOriginal.nom, gwose: item.gwose, qte: item.qte, total: kob, pwofi: isNaN(pwofi) ? 0 : pwofi });
            resiHTML += `<tr><td>${pOriginal.nom} (${item.gwose})</td><td>${item.qte}</td><td style="text-align:right;">${kob}</td></tr>`;
        }
    });

    if(tip === 'kredi' && clientId) {
        let k = lisKliyan.find(k => k.id == clientId);
        if(k) k.det += total;
        localStorage.setItem('kliyanData', JSON.stringify(lisKliyan));
        alert("Vant kredi a sove sou kont kliyan an!");
    } else if (tip === 'resi') {
        document.getElementById('dat-resi').innerText = new Date().toLocaleString('ht-HT');
        document.getElementById('resi-items').innerHTML = resiHTML;
        document.getElementById('resi-total-print').innerText = total + " HTG";
        document.getElementById('modal-resi').style.display = 'flex';
    } else {
        alert("Vant lan anrejistre kach san resi.");
    }

    localStorage.setItem('estokData', JSON.stringify(estok));
    localStorage.setItem('vantData', JSON.stringify(istorikVant));
    panyen = []; rafrechiEkran();
}
function femenResi() { document.getElementById('modal-resi').style.display = 'none'; }
