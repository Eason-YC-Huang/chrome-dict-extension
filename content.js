// content.js
document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
        showTranslationIcon(e.clientX, e.clientY, selection);
    }
});

function showTranslationIcon(x, y, text) {
    const icon = document.createElement('div');
    icon.className = 'trans-icon';
    icon.innerHTML = '😄';
    icon.style.position = 'fixed';
    icon.style.left = `${x + 10}px`;
    icon.style.top = `${y+5}px`;
    icon.style.fontSize = '24px';
    icon.style.zIndex = '9999';
    icon.onclick = () => {
        console.log('clicked');
        document.body.removeChild(icon);
        return  fetchTranslation(text);
    };
    document.body.appendChild(icon);

    // 点击其他地方移除图标
    const handleOutsideClick = (e) => {
        if (!icon.contains(e.target)) {
            try {
                document.body.removeChild(icon);
            }catch (e){}
            document.removeEventListener('click', handleOutsideClick);
        }
    };

    // 添加延迟，避免 mouseup 事件触发的 click 事件移除图标
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 100);
}

async function fetchTranslation(text) {
    try {
        const url = "https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q="
        const response = await fetch(url + text);
        const html = await response.text();
        const regex = /<div id="client_def_container" class="client_def_container">(.*?)<div class="client_def_container">/is;
        const match = html.match(regex);
        if (match) {
            const translation = match[1];
            console.log('Translation:', translation);
            showResultPopup(translation);
        } else {
            console.error('Content not found!');
        }
    } catch (error) {
        console.error('Failed to translate:', error);
    }
}

function showResultPopup(translation) {
    const popup = document.createElement('div');
    popup.className = 'trans-popup';
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const popupWidth = 300;
    const popupHeight = 200;
    popup.style.left = `${(windowWidth - popupWidth) / 2}px`;
    popup.style.top = `${(windowHeight - popupHeight) / 2}px`;

    popup.innerHTML = `
    <div class="header">
      <span>Translation</span>
      <button class="close-btn">×</button>
    </div>
    <div class="content">${translation}</div>
  `;
    console.log('Popup created:', popup);

    const header = popup.querySelector('.header');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            popup.style.left = `${e.clientX - offsetX}px`;
            popup.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.body.appendChild(popup);
    console.log('Popup appended to body:', popup);
    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        console.log('Close button clicked, removing popup:', popup);
        document.body.removeChild(popup);
    });
}
