let estok = JSON.parse(localStorage.getItem('estokBoutik')) || [];

// Kore otomatikman nenpòt ansyen done ki te konn anrejistre san 'sizes'
estok = estok.map(p => {
    if (!p.sizes) {
        p.sizes = [{ gwose: p.gwose || 'Standard', kantite: p.kantite || 0 }];
    }
    return p;
});

let listwaVant = JSON.parse(localStorage.getItem('vantBoutik')) || [];
let panyenKouran = []; 
let roleItilizate = null; 
let kategoriAktuel = 'Tout';

function konekte() {
    let user = document.getElementById('username').value.trim().toLowerCase();
    let pass = document.getElementById('password').value.trim();

    if ((user === 'admin' && pass === 'admin123') || (user === 'a' && pass === '1')) {
        roleItilizate = 'admin';
    } else if (user === 'kesye' && pass === 'kesye123') {
        roleItilizate = 'kesye';
    } else {
        alert("Kòd la pa bon!"); return;
    }

    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-display').innerText = `| Mod: ${roleItilizate.toUpperCase()}`;
    
    document.getElementById('admin-panel').style.display = (roleItilizate === 'kesye') ? 'none' : 'flex';
    rafrechiEkran();
}

function dekonekte() {
    roleItilizate = null;
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-modal').style.display = 'flex';
}

function filtreKategori(kategori) {
    kategoriAktuel = kategori;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.includes(kategori)) btn.classList.add('active');
    });
    rafrechiEkran();
}

function chanjeKategoriEstok() {
    let kat = document.getElementById('kategori-estok').value;
    if (kat === 'Tennis') {
        document.getElementById('seksyon-nimewo-tennis').style.display = 'block';
        document.getElementById('seksyon-gwose-nomal').style.display = 'none';
    } else {
        document.getElementById('seksyon-nimewo-tennis').style.display = 'none';
        document.getElementById('seksyon-gwose-nomal').style.display = 'block';
    }
}

function rafrechiEkran() {
    const grid = document.getElementById('product-grid');
    if (grid) {
        grid.innerHTML = '';
        estok.forEach((pwodwi, index) => {
            if(kategoriAktuel === 'Tout' || pwodwi.kategori === kategoriAktuel) {
                let sizesList = pwodwi.sizes || [];
                let totalStok = sizesList.reduce((sum, s) => sum + s.kantite, 0);
                let opacity = totalStok <= 0 ? '0.5' : '1';
                let cursor = totalStok <= 0 ? 'not-allowed' : 'pointer';
                
                let vizyelHtml = '';
                if (pwodwi.foto && pwodwi.foto !== "") {
                    vizyelHtml = `<img src="${pwodwi.foto}" class="product-image" alt="${pwodwi.nom}">`;
                } else {
                    let emoji = pwodwi.kategori === 'Tennis' ? '👟' : pwodwi.kategori === 'Kepi' ? '🧢' : '👕';
                    vizyelHtml = `<div style="font-size: 35px; margin-bottom: 10px;">${emoji}</div>`;
                } 

                grid.innerHTML += `
                    <div class="product-card" style="opacity: ${opacity}; cursor: ${cursor}; position: relative;" onclick="louvriModalGwose(${index})">
                        ${vizyelHtml}
                        <div style="font-weight: 600; color: #111;">${pwodwi.nom}</div>
                        <div class="price" style="color:#27ae60; font-weight:bold;">${pwodwi.priVant.toLocaleString()} HTG</div>
                        <div class="stock" style="font-size:0.8em; color:gray;">Total An stòk: ${totalStok}</div>
                    </div>`;
            }
        });
    } 

    const tbodyPanyen = document.getElementById('panyen-body');
    if (tbodyPanyen) {
        tbodyPanyen.innerHTML = '';
        let totalPanyen = 0;
        panyenKouran.forEach((atik, i) => {
            let kòb = atik.qte * atik.pwodwi.priVant;
            totalPanyen += kòb;
            let labelDetay = `Nimero/Gwosè: ${atik.gwose}`;
            tbodyPanyen.innerHTML += `
                <tr>
                    <td><strong>${atik.pwodwi.nom}</strong> <br><small>${labelDetay}</small></td>
                    <td style="text-align:center;">x${atik.qte}</td>
                    <td style="text-align:right;">${kòb}</td>
                    <td style="text-align:right;"><button class="btn-red" style="padding:4px 8px; border-radius:50%;" onclick="retireNanPanyen(${i})">X</button></td>
                </tr>`;
        });
        document.getElementById('total-panyen').innerText = totalPanyen.toLocaleString();
    } 

    const tbodyEstok = document.getElementById('estok-body');
    if (tbodyEstok) {
        tbodyEstok.innerHTML = '';
        estok.forEach((pwodwi, index) => {
            let sizesList = pwodwi.sizes || [];
            let listSizesText = sizesList.map(s => `<span style="background:#111; color:white; padding:3px 6px; border-radius:5px; font-size:11px; margin-right:3px;">${s.gwose}: ${s.kantite}</span>`).join(' ');
            let totalAchaAfficher = pwodwi.totalAchaInvesti || 0;
            tbodyEstok.innerHTML += `
                <tr>
                    <td><strong>${pwodwi.nom}</strong> <br><small>${pwodwi.kategori}</small></td>
                    <td>${listSizesText}</td>
                    <td>${totalAchaAfficher} HTG</td>
                    <td>${pwodwi.priVant} HTG</td>
                    <td style="text-align:center;">
                        <button class="btn-delete" onclick="efasePwodwiNanEstok(${index})" title="Retire Pwodwi a nèt">🗑️</button>
                    </td>
                </tr>`;
        });
    } 

    const tbodyIstorik = document.getElementById('istorik-vant-body');
    if (tbodyIstorik) {
        tbodyIstorik.innerHTML = '';
        let totalRantre = 0, totalBenefis = 0, atikVann = 0; 

        [...listwaVant].reverse().forEach(vant => {
            totalRantre += vant.total;
            totalBenefis += vant.pwofi;
            atikVann += vant.kantite;
            
            let tipBadj = vant.tip === 'pesonel' 
                ? '<span style="background:#95a5a6; color:white; padding:2px 5px; border-radius:3px; font-size:10px;">Pèsonèl</span>' 
                : '<span style="background:#27ae60; color:white; padding:2px 5px; border-radius:3px; font-size:10px;">Biznis</span>';

            tbodyIstorik.innerHTML += `
                <tr>
                    <td style="font-size: 12px; color: gray;">${vant.dat}</td>
                    <td>${tipBadj}</td>
                    <td><strong>${vant.nom}</strong></td>
                    <td>${vant.gwose}</td>
                    <td>${vant.kantite}</td>
                    <td>${vant.total.toLocaleString()} HTG</td>
                    <td style="color: #27ae60; font-weight: bold;">+ ${vant.pwofi.toLocaleString()} HTG</td>
                </tr>`;
        }); 

        document.getElementById('total-lavant').innerText = totalRantre.toLocaleString() + ' HTG';
        document.getElementById('total-benefis').innerText = totalBenefis.toLocaleString() + ' HTG';
        document.getElementById('total-atik').innerText = atikVann;
    } 

    localStorage.setItem('estokBoutik', JSON.stringify(estok));
    localStorage.setItem('vantBoutik', JSON.stringify(listwaVant));
} 

let pwodwiKouranIndex = null;

function louvriModalGwose(index) {
    pwodwiKouranIndex = index;
    let pwodwi = estok[index];
    document.getElementById('modal-tit-pwodwi').innerText = pwodwi.nom;
    
    let listeContainer = document.getElementById('modal-liste-gwose');
    listeContainer.innerHTML = '';
    
    let sizesList = pwodwi.sizes || [];
    sizesList.forEach(s => {
        let btnDisabled = s.kantite <= 0 ? 'disabled style="background:#ccc; cursor:not-allowed;"' : '';
        let stockText = s.kantite <= 0 ? '<span style="color:red; font-size:12px;">Fini</span>' : `<span style="color:green; font-size:12px;">Stòk: ${s.kantite}</span>`;
        
        listeContainer.innerHTML += `
            <div class="size-select-row">
                <div>
                    <strong>Nimero/Gwosè: ${s.gwose}</strong><br>
                    ${stockText}
                </div>
                <button class="btn-dark" ${btnDisabled} onclick="chwaziGwosePouPanyen('${s.gwose}')">Chwazi</button>
            </div>`;
    });
    
    document.getElementById('modal-chwazi-gwose').style.display = 'flex';
}

function femenModalGwose() {
    document.getElementById('modal-chwazi-gwose').style.display = 'none';
}

function chwaziGwosePouPanyen(gwose) {
    let pwodwi = estok[pwodwiKouranIndex];
    let sizesList = pwodwi.sizes || [];
    let sizeObj = sizesList.find(s => s.gwose === gwose);
    
    if (!sizeObj || sizeObj.kantite <= 0) {
        alert("Pa gen ase nan stòk pou nimewo sa a!"); return;
    }

    let indexNanPanyen = panyenKouran.findIndex(p => p.indexOriginal === pwodwiKouranIndex && p.gwose === gwose);
    if (indexNanPanyen > -1) {
        if (panyenKouran[indexNanPanyen].qte + 1 > sizeObj.kantite) {
            alert("Ou rive nan limit stòk ki disponib pou nimewo sa a!"); return;
        }
        panyenKouran[indexNanPanyen].qte += 1;
    } else {
        panyenKouran.push({ pwodwi: pwodwi, gwose: gwose, qte: 1, indexOriginal: pwodwiKouranIndex });
    }
    
    femenModalGwose();
    rafrechiEkran();
}

function efasePwodwiNanEstok(index) {
    let konfimasyon = confirm(`Èske w sèten ou vle efase "${estok[index].nom}" nèt nan estòk la?`);
    if (konfimasyon) {
        estok.splice(index, 1);
        rafrechiEkran();
    }
}

function konpreseFoto(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 250; 
            const MAX_HEIGHT = 250;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            callback(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function ajouteNanEstok() {
    const nom = document.getElementById('nom-estok').value.trim();
    const kategori = document.getElementById('kategori-estok').value;
    const totalAcha = parseFloat(document.getElementById('total-acha').value);
    const priVant = parseFloat(document.getElementById('pri-vant').value);
    const fichierFoto = document.getElementById('foto-estok').files[0]; 

    if (!nom || isNaN(totalAcha) || isNaN(priVant)) {
        alert("Ranpli non pwodwi a, total acha a, ak pri vant lan kòrèkteman!"); return;
    } 

    let sizesArray = [];
    let totalKantiteAchte = 0;

    if (kategori === 'Tennis') {
        let sizeInputs = document.querySelectorAll('.qty-num');
        sizeInputs.forEach(input => {
            let qte = parseInt(input.value);
            if (!isNaN(qte) && qte > 0) {
                sizesArray.push({ gwose: input.getAttribute('data-num'), kantite: qte });
                totalKantiteAchte += qte;
            }
        });

        if (sizesArray.length === 0) {
            alert("Tanpri mete omwen yon kantite nan youn nan nimewo tennis yo!"); return;
        }
    } else {
        const gwose = document.getElementById('gwose-estok').value.trim() || 'Standard';
        const qteNomal = parseInt(document.getElementById('kantite-nomal').value);
        if (isNaN(qteNomal) || qteNomal <= 0) {
            alert("Tanpri antre yon kantite valid pou atik sa a!"); return;
        }
        sizesArray.push({ gwose: gwose, kantite: qteNomal });
        totalKantiteAchte = qteNomal;
    }

    let priAchaInite = totalAcha / totalKantiteAchte;

    if (fichierFoto) {
        konpreseFoto(fichierFoto, function(base64FotoLeje) {
            sovePwodwiNouvo(nom, kategori, sizesArray, totalAcha, priAchaInite, priVant, base64FotoLeje);
            netwayeFomilèEstok();
        });
    } else {
        sovePwodwiNouvo(nom, kategori, sizesArray, totalAcha, priAchaInite, priVant, "");
        netwayeFomilèEstok();
    }
} 

function sovePwodwiNouvo(nom, kategori, sizesArray, totalAcha, priAchaInite, priVant, fotoData) {
    let pwodwiEgziste = estok.find(p => p.nom.toLowerCase() === nom.toLowerCase() && p.kategori === kategori);
    
    if (pwodwiEgziste) {
        pwodwiEgziste.totalAchaInvesti = (pwodwiEgziste.totalAchaInvesti || 0) + totalAcha;
        pwodwiEgziste.priAcha = priAchaInite;
        pwodwiEgziste.priVant = priVant;
        if (fotoData !== "") pwodwiEgziste.foto = fotoData;
        
        if (!pwodwiEgziste.sizes) pwodwiEgziste.sizes = [];

        sizesArray.forEach(newSize => {
            let existingSize = pwodwiEgziste.sizes.find(s => s.gwose === newSize.gwose);
            if (existingSize) {
                existingSize.kantite += newSize.kantite;
            } else {
                pwodwiEgziste.sizes.push(newSize);
            }
        });
    } else {
        estok.push({
            nom,
            kategori,
            sizes: sizesArray,
            totalAchaInvesti: totalAcha,
            priAcha: priAchaInite,
            priVant,
            foto: fotoData
        });
    }
}

function netwayeFomilèEstok() {
    document.getElementById('nom-estok').value = ''; 
    document.getElementById('gwose-estok').value = '';
    document.getElementById('kantite-nomal').value = '';
    document.getElementById('total-acha').value = '';
    document.getElementById('pri-vant').value = '';
    document.getElementById('foto-estok').value = ''; 
    document.querySelectorAll('.qty-num').forEach(input => input.value = '');
    rafrechiEkran();
}

function retireNanPanyen(index) { panyenKouran.splice(index, 1); rafrechiEkran(); }

function valideVantLan(tipVant) {
    if (panyenKouran.length === 0) {
        alert("Panyen an vid!"); return;
    }

    let kòbTotal = 0;
    document.getElementById('resi-body').innerHTML = '';
    let datJodiA = new Date().toLocaleString('ht-HT');
    document.getElementById('dat-resi').innerText = datJodiA;
    
    let rezimePwodwiFini = [];

    panyenKouran.forEach(atik => {
        let pwodwiNanEstok = estok[atik.indexOriginal];
        let sizesList = pwodwiNanEstok.sizes || [];
        let sizeObj = sizesList.find(s => s.gwose === atik.gwose);
        
        sizeObj.kantite -= atik.qte;
        let kòbAtik = atik.qte * pwodwiNanEstok.priVant;
        let pwofiAtik = (pwodwiNanEstok.priVant - (pwodwiNanEstok.priAcha || 0)) * atik.qte;
        kòbTotal += kòbAtik;
        
        listwaVant.push({ 
            dat: datJodiA,
            nom: pwodwiNanEstok.nom, 
            gwose: atik.gwose, 
            kantite: atik.qte, 
            total: kòbAtik, 
            pwofi: pwofiAtik,
            tip: tipVant 
        });
        
        document.getElementById('resi-body').innerHTML += `<tr><td>${pwodwiNanEstok.nom} <br><small>(Nimero: ${atik.gwose})</small></td><td>x${atik.qte}</td><td style="text-align:right;">${kòbAtik}</td></tr>`;

        if (sizeObj.kantite === 0) {
            rezimePwodwiFini.push({
                nom: pwodwiNanEstok.nom,
                gwose: atik.gwose,
                kategori: pwodwiNanEstok.kategori
            });
        }
    });

    document.getElementById('resi-total').innerText = kòbTotal.toLocaleString();
    panyenKouran = []; 
    rafrechiEkran(); 
    
    if (rezimePwodwiFini.length > 0) {
        let mesajFini = "🎯 ATANSYON: Gen nimewo ki fini nèt nan stòk la!\n\n";
        rezimePwodwiFini.forEach(item => {
            mesajFini += `• ${item.nom} (Nimero/Gwosè ${item.gwose}) fini.\n`;
        });
        alert(mesajFini);
    }

    if (tipVant === 'biznis') {
        document.getElementById('resi-modal').style.display = 'flex';
    } else {
        alert("Vant Pèsonèl la byen anrejistre nan sistèm nan san resi.");
    }
}

function enprimeResi() {
    window.print(); 
}

function femenResi() {
    document.getElementById('resi-modal').style.display = 'none';
}

function efaseRapo() {
    let konfimasyon = confirm("Èske w sèten ou vle fèmen kès la? Sa ap efase istorik vant jodi a.");
    if (konfimasyon) { listwaVant = []; rafrechiEkran(); }
}
