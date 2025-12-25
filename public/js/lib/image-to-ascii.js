function imageToAscii(imagePath, containerId, options = {}) {
    const {
        width = 200,
        fontSize = 4,
        charSet = " .:-=+*#%@"
    } = options;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const aspectRatio = img.height / img.width;
        const height = Math.floor(width * aspectRatio * 0.5);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        let asciiArt = "";
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const offset = (y * width + x) * 4;
                const r = pixels[offset];
                const g = pixels[offset + 1];
                const b = pixels[offset + 2];

                const brightness = (r + g + b) / 3;

                const charIndex = Math.floor((brightness / 255) * (charSet.length - 1));
                asciiArt += charSet[charIndex];
            }
            asciiArt += "\n";
        }

        const container = document.getElementById(containerId);
        if (container) {
            container.style.fontFamily = "monospace";
            container.style.fontSize = fontSize + "px";
            container.style.lineHeight = fontSize + "px";
            container.style.whiteSpace = "pre";
            container.style.overflow = "hidden";
            container.style.letterSpacing = "0";
            container.style.color = "black";
            container.textContent = asciiArt;
        }
    };

    img.onerror = function() {
        console.error("Failed to load image:", imagePath);
    };

    img.src = imagePath;
}
