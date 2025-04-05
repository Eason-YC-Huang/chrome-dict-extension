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
    icon.innerHTML = '🔍';
    icon.style.position = 'fixed';
    icon.style.left = `${x + 15}px`;
    icon.style.top = `${y}px`;
    icon.onclick = () => {
        console.log('clicked');
        // 点击图标后移除图标
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
        const response = await fetch(`https://dict.youdao.com/w/${text}`);
        const html = await response.text();
        const regex = /<div class="trans-container">(.*?)<\/div>/is;
        const match = html.match(regex);
        if (match) {
            const translation = match[1];
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
