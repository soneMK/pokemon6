let selectedIndex = null;
const slots = document.querySelectorAll('.slot');
const input = document.getElementById('p-input');
const status = document.getElementById('status');

function selectSlot(index) {
    slots.forEach(s => s.classList.remove('selected'));
    selectedIndex = index;
    slots[index].classList.add('selected');
    input.focus();
}

// カタカナ入力をPokeAPIに投げる
input.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && selectedIndex !== null) {
        const query = input.value.trim();
        if (!query) return;
        
        status.innerText = "ポケモンを探しています...";
        try {
            // 日本語名で直接species情報を検索（最新ポケモンまで対応）
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(query)}/`);
            if (!res.ok) throw new Error();
            const sData = await res.json();
            
            // 図鑑番号から画像を取得
            const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${sData.id}`);
            const data = await pRes.json();
            
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Canvas保存のために必須
            img.src = data.sprites.other['official-artwork'].front_default;
            
            img.onload = () => {
                slots[selectedIndex].innerHTML = `<img src="${img.src}">`;
                input.value = ""; 
                status.innerText = "";
                slots[selectedIndex].classList.remove('selected');
                selectedIndex = null;
                document.getElementById('share-btn').style.display = "block";
            };
        } catch (err) {
            status.innerText = "見つかりません（カタカナで正確に打ってね）";
        }
    }
});

// 画像合成・ダウンロード
function generateImage() {
    const canvas = document.getElementById('export-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000; canvas.height = 1200;
    
    // 背景（ハイパーボール）
    ctx.fillStyle = "#333"; ctx.fillRect(0, 0, 1000, 540);
    ctx.fillStyle = "#ffcb05"; ctx.fillRect(0, 540, 1000, 120);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 660, 1000, 540);
    
    // タイトル
    ctx.fillStyle = "white"; ctx.font = "bold 60px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("#私を構成するポケモン6匹", 500, 100);

    const pad = 40; const size = 420;
    slots.forEach((slot, i) => {
        const x = 50 + (i % 2) * (size + pad);
        const y = 180 + Math.floor(i / 2) * (size + pad);
        ctx.fillStyle = "white"; ctx.strokeStyle = "black"; ctx.lineWidth = 10;
        ctx.strokeRect(x, y, size, size); ctx.fillRect(x, y, size, size);
        const img = slot.querySelector('img');
        if (img) ctx.drawImage(img, x+20, y+20, size-40, size-40);
    });

    const link = document.createElement('a');
    link.download = 'my-pokemon-team.png';
    link.href = canvas.toDataURL(); link.click();
}

// Xシェア
document.getElementById('share-btn').onclick = () => {
    const text = encodeURIComponent("私を構成するポケモン6匹を選んだよ！ #私を構成するポケモン6匹");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
};