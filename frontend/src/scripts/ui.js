const Draw = require("./draw.js");

function xy(x, y) {
    return { "x": x, "y": y };
}

class UIRect {
    constructor(x, y, w, h, c, padding = 0, margin = 0) {
        this.x = x + margin;
        this.y = y + margin;
        this.w = w - 2 * margin;
        this.h = h - 2 * margin;
        this.c = c;
        this.padding = padding;
        this.padded = this;
        if (padding > 0) {
            this.padded = this.get_padded();
        }
        this.children = [];
    }

    get_padded() {
        return new UIRect(
            this.x + this.padding,
            this.y + this.padding,
            this.w - 2 * this.padding,
            this.h - 2 * this.padding,
            this.c,
            0,
            0);
    }

    draw_self(ctx) {
        Draw.rectangle(ctx, this.x, this.y, this.w, this.h, null, this.c);
    }

    draw(ctx) {
        this.draw_self(ctx);
        this.children.map((c) => { c.draw(ctx); });
    }

    center() {
        return xy(this.x + this.w / 2, this.y + this.h / 2);
    }

    top_left() {
        return xy(this.x, this.y);
    }

    top_right() {
        return xy(this.x + this.w, this.y);
    }

    bottom_left() {
        return xy(this.x, this.y + this.h);
    }

    bottom_right() {
        return xy(this.x + this.w, this.y + this.h);
    }

    top() {
        return xy(this.x + this.w / 2, this.y);
    }

    bottom() {
        return xy(this.x + this.w / 2, this.y + this.h);
    }

    left() {
        return xy(this.x, this.y + this.h / 2);
    }

    right() {
        return xy(this.x + this.w, this.y + this.h / 2);
    }

    is_inside(x, y) {
        return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
    }
}

class UIText {
    constructor(x, y, color, font, text = "") {
        this.x = x;
        this.y = y;
        this.c = color;
        this.text = text;
        this.textAlign = "center";
        this.font = "" + Math.floor(font) + "px monospace";
        this.w = 0.6 * font * 5;
    }

    left() {
        return xy(this.x - this.w, this.y);
    }

    draw(ctx) {
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.c;
        ctx.fillText(this.text, this.x, this.y);
    }
}

class UIButton extends UIRect {
    constructor(x, y, w, h, c, label = null) {
        super(x, y, w, h, c);
        if (label === null) {
            this.label = null;
        } else {
            this.label = new UIText(x + w / 2, y + h / 2, c, h / 2, label);
            this.children.push(this.label);
        }
        this.on_click = null;
        this.state = "active";
        this.base_color = c;
        this.icon = null;
    }

    hide() {
        this.state = "hidden";
    }

    show() {
        if (this.state === "hidden") {
            this.state = "active";
        }
    }

    draw(ctx) {
        if (this.state === "hidden") {
            return;
        }
        this.draw_self(ctx);
        this.children.map((c) => { c.draw(ctx); });
        if (this.icon) {
            const tower = this.center();
            tower.w = this.w;
            tower.rotation = Math.PI / 2;
            tower.target = null;
            this.icon(ctx, tower, null);
        }
    }

    set_temporary_color(label = null, rect = null) {
        if (this.label != null) {
            if (label != null) {
                this.label.c = label;
            }
            else {
                this.label.c = this.base_color;
            }
        }
        if (rect != null) {
            this.c = rect;
        }
        else {
            this.c = this.base_color;
        }
    }

    transition(state) {
        console.assert(this.state != state);
        this.state = state;
        const blue = "rgba(0,128,255,1)";
        const grey = "rgba(180,180,180,1)";
        const red = "rgba(255,0,0,1)";
        if (state === "active") {
            this.set_temporary_color();
        } else if (state === "hovered") {
            this.set_temporary_color(blue, blue);
        } else if (state === "clicked") {
            this.set_temporary_color(blue, grey);
        } else if (state === "disabled") {
            this.set_temporary_color(grey, grey);
        } else if (state === "selected") {
            this.set_temporary_color(blue, blue);
        } else {
            this.set_temporary_color(red, red);
        }
    }

    click(x, y) {
        if (this.state === "hidden") {
            return;
        }
        if (["active", "hovered"].includes(this.state) && this.is_inside(x, y)) {
            this.transition("clicked");
        }
    }

    release(x, y) {
        if (this.state === "hidden") {
            return;
        }
        if (this.state === "clicked") {
            if (this.is_inside(x, y)) {
                this.transition("hovered");
                if (this.on_click != null) {
                    this.on_click(this);
                }
            }
            else {
                this.transition("active");
            }
        }
    }

    hover(x, y) {
        if (this.state === "hidden") {
            return;
        }
        const inside = this.is_inside(x, y);
        if (this.state === "hovered" && !inside) {
            this.transition("active");
        }
        else if (this.state === "active" && inside) {
            this.transition("hovered");
        }
    }
}

class UI extends UIRect {
    constructor(x, y, w, h, c, padding = 0, margin = 0) {
        super(x, y, w, h, c, padding, margin);

        const inner = this.get_padded();
        this.inner = inner;
        this.inner.c = null;
        this.children.push(inner);
        this.buttons = [];
        this.tower_buttons = [];

        let flow = this.inner.padded.right();
        {
            const level = new UIText(flow.x - padding, flow.y, this.c, 0.3 * h);
            level.textAlign = "right";
            this.level = level;
            this.children.push(level);
            flow = level.left();
        }
        {
            const btn_w = w / 10;
            const btn_h = h / 3;
            const btn_x = flow.x - btn_w - padding;
            const btn_y = flow.y - btn_h / 2;
            const button = new UIButton(btn_x, btn_y, btn_w, btn_h, this.c, "Start");
            this.buttons.push(button);
            this.start_button = button;
            this.children.push(button);
            flow = button.left();
        }
        {
            const money = new UIText(flow.x - padding, flow.y, this.c, 0.3 * h);
            money.textAlign = "right";
            this.money = money;
            this.children.push(money);
        }
        this.next_x = this.inner.padded.left().x;
    }

    add_tower_button(name, icon, on_click) {
        const btn_h = this.inner.padded.h;
        const btn_w = btn_h;
        const btn_y = this.inner.padded.top().y;

        const button = new UIButton(this.next_x, btn_y, btn_w, btn_h, this.c);

        button.name = name;
        button.icon = icon;
        button.on_click = on_click;

        this.tower_buttons.push(button);
        this.buttons.push(button);
        this.children.push(button);
        this.next_x += btn_w + this.padding;
        return button;
    }

    click(x, y) {
        for (let button of this.buttons) {
            button.click(x, y);
        }
    }

    release(x, y) {
        for (let button of this.buttons) {
            button.release(x, y);
        }
    }

    hover(x, y) {
        for (let button of this.buttons) {
            button.hover(x, y);
        }
    }
}

module.exports = {
    UI,
};
