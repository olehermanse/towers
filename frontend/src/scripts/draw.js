const PI = 3.14159;

function line(ctx, x1, y1, x2, y2, strokeStyle = 'rgba(0, 0, 0, 0.25)', lineWidth = 1) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function circle(ctx, x, y, r) {
    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * PI);
    ctx.fill();
    ctx.stroke();
}

function triangle(ctx, x, y, r, angle, fill = 'rgba(0, 200, 0, 1)', stroke = 'white') {
    const height = r * 2;
    const side = height * (2 / (Math.sqrt(3)));

    // Matrix transformation
    ctx.translate(x, y);
    ctx.rotate(-angle);
    ctx.translate(-x, -y);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x - r * (1 / 2), y - r * (Math.sqrt(3) / 2));
    ctx.lineTo(x - r * (1 / 2), y + r * (Math.sqrt(3) / 2));
    ctx.lineTo(x + r, y);

    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function rectangle(ctx, x, y, w, h, fill = "black", stroke = null) {
    if (fill) {
        ctx.fillStyle = fill;
        ctx.lineWidth = 2;
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);

    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

function background(ctx, width, height) {
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, width, height);
}

function grid(ctx, size, width, height) {
    for (let x = size; x < width; x += size) {
        line(ctx, x, 0, x, height);
    }
    for (let y = size; y < height; y += size) {
        line(ctx, 0, y, width, y);
    }
}

module.exports = {
    circle,
    triangle,
    rectangle,
    line,
    background,
    grid,
};
