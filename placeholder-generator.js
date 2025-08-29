// グローバル関数として定義
window.generatePlaceholder = function(width, height, bgColor, textColor, text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width || 300;
    canvas.height = height || 300;
    
    // Draw background
    ctx.fillStyle = bgColor || '#2196F3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.fillStyle = textColor || '#ffffff';
    ctx.font = `${Math.min(canvas.width, canvas.height) / 8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || 'Placeholder', canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL();
}

// Replace placeholder images on page load
document.addEventListener('DOMContentLoaded', function() {
    const placeholderImages = document.querySelectorAll('img[src*="via.placeholder.com"]');
    
    placeholderImages.forEach(img => {
        const src = img.src;
        const match = src.match(/(\d+)x(\d+)\/([A-Fa-f0-9]{6})\/([A-Fa-f0-9]{6})\?text=(.+)/);
        
        if (match) {
            const [, width, height, bgColor, textColor, text] = match;
            const dataUrl = window.generatePlaceholder(
                parseInt(width),
                parseInt(height),
                '#' + bgColor,
                '#' + textColor,
                decodeURIComponent(text)
            );
            img.src = dataUrl;
        }
    });
    
    // Also handle images that fail to load
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            if (this.src.includes('via.placeholder.com')) {
                const match = this.src.match(/(\d+)x(\d+)\/([A-Fa-f0-9]{6})\/([A-Fa-f0-9]{6})\?text=(.+)/);
                if (match) {
                    const [, width, height, bgColor, textColor, text] = match;
                    this.src = window.generatePlaceholder(
                        parseInt(width),
                        parseInt(height),
                        '#' + bgColor,
                        '#' + textColor,
                        decodeURIComponent(text)
                    );
                }
            }
        };
    });
});