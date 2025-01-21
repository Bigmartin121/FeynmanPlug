const fs = require('fs');
const path = require('path');

// 一个简单的 1x1 像素的蓝色 PNG
const minimalPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

// 确保目标目录存在
const targetDir = path.join(__dirname, '../../../dist/assets/icons');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 创建不同尺寸的图标
const sizes = [16, 48, 128];
sizes.forEach(size => {
    const iconPath = path.join(targetDir, `icon${size}.png`);
    fs.writeFileSync(iconPath, minimalPng);
    console.log(`Created icon: ${iconPath}`);
});
