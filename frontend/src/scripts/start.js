const { fill_stroke } = require("../../../libtowers/utils.js");
const Draw = require("./draw.js");
const { CanvasManager } = require("./canvas_manager.js");
const { GREY, BLACK, GREEN, BRIGHT_BLUE, DARK_BLUE, BRIGHT_PURPLE, DARK_PURPLE } = require("./colors.js");

let canvas_manager = null;

function draw_tower_generic(ctx, x, y, s, rotation, circle, triangle) {
    const r = (s / 2) * 0.7;
    if (circle != null) {
        Draw.circle(ctx, x, y, r, circle.fill, circle.stroke, 4);
    }
    if (triangle != null) {
        Draw.triangle(ctx, x, y, r, rotation, triangle.fill, triangle.stroke);
    }
}

function draw_rock(ctx, t, target = null) {
    const circle = fill_stroke(GREY, BLACK);
    draw_tower_generic(ctx, t.x, t.y, t.w, t.rotation, circle, null);
}

function draw_gun_tower(ctx, t, target = null) {
    const circle = fill_stroke(GREY, BLACK);
    const triangle = fill_stroke(GREEN, BLACK);
    if (target != null) {
        const stroke = GREEN;
        Draw.line(ctx, t.x, t.y, target.x, target.y, stroke, 5 * t.intensity);
    }
    draw_tower_generic(ctx, t.x, t.y, t.w, t.rotation, circle, triangle);
}

function draw_slow_tower(ctx, t, target = null) {
    const circle = fill_stroke(GREY, BLACK);
    const triangle = fill_stroke(BRIGHT_BLUE, DARK_BLUE);
    if (target != null) {
        const stroke = BRIGHT_BLUE;
        Draw.line(ctx, t.x, t.y, target.x, target.y, stroke, 5 * t.intensity);
    }
    draw_tower_generic(ctx, t.x, t.y, t.w, t.rotation, circle, triangle);
}

function draw_laser_tower(ctx, t, target = null) {
    const circle = fill_stroke(GREY, BLACK);
    const triangle = fill_stroke(BRIGHT_PURPLE, DARK_PURPLE);
    if (target != null) {
        const stroke = BRIGHT_PURPLE;
        Draw.line(ctx, t.x, t.y, target.x, target.y, stroke, 5 * t.intensity);
    }
    draw_tower_generic(ctx, t.x, t.y, t.w, t.rotation, circle, triangle);
}

function draw_bank(ctx, t, target = null) {
    const s = (t.w / 2) * 0.5;
    Draw.rectangle(ctx, t.x - s, t.y - s, 2 * s, 2 * s, "yellow", BLACK, 4);
}

function draw_building(ctx, t, target = null) {
    if (t.name === "bank") {
        return draw_bank(ctx, t, target);
    }
    if (t.name === "laser") {
        return draw_laser_tower(ctx, t, target);
    }
    if (t.name === "slow") {
        return draw_slow_tower(ctx, t, target);
    }
    if (t.name === "gun") {
        return draw_gun_tower(ctx, t, target);
    }
    if (t.name === "rock") {
        return draw_rock(ctx, t, target);
    }
}

function on_victory() {
    const ui = canvas_manager.ui;
    const game = canvas_manager.game;
    ui.start_button.transition("active");
    switch (game.level) {
        case 2:
            ui.tower_buttons[0].show();
            break;
        case 5:
            ui.tower_buttons[2].show();
            break;
        case 8:
            ui.tower_buttons[3].show();
            break;
        case 11:
            ui.tower_buttons[4].show();
            break;
        default:
            break;
    }
}

function on_start_click() {
    canvas_manager.game.start();
    canvas_manager.ui.start_button.transition("disabled");
}

function select(btn) {
    canvas_manager.ui.selected = btn;
    if (btn.state != "selected") {
        btn.transition("selected");
    }
    for (let button of canvas_manager.ui.tower_buttons) {
        if (button != btn && button.state === "selected") {
            button.transition("active");
        }
    }
}

function start(canvas) {
    const scale = window.devicePixelRatio;
    let rows = 13;
    let columns = 20;
    if (window.matchMedia("screen and (orientation:portrait), (max-width: 600px)").matches) {
        rows = 17;
        columns = 15;
    }
    canvas_manager = new CanvasManager(canvas, columns, rows, 1200, scale);
    const ctx = canvas.getContext("2d");
    canvas.setAttribute("width", canvas_manager.canvas_width);
    canvas.setAttribute("height", canvas_manager.canvas_height);
    canvas_manager.setup_events(canvas, select, draw_building, on_start_click, on_victory);
    const ms = 10;
    window.setInterval(() => {
        canvas_manager.tick(ms);
        if (canvas_manager.space_pressed) {
            canvas_manager.tick(ms);
            canvas_manager.tick(ms);
        }
        canvas_manager.draw(ctx);
    }, ms)
}

module.exports = {
    start,
};
