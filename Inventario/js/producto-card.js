class ProductoCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._disabled = false;
  }

  set producto(datos) {
    this._producto = datos;
    this.render();
  }

  set disabled(value) {
    this._disabled = Boolean(value);
    this.shadowRoot.querySelectorAll("button").forEach((button) => {
      button.disabled = this._disabled;
    });
  }

  render() {
    if (!this._producto) return;

    const producto = this._producto;
    const stock = Number(producto.stock);
    const card = document.createElement("article");
    card.className = "card";

    const top = document.createElement("div");
    top.className = "card-top";
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = producto.categoria;
    const badge = document.createElement("span");
    badge.className = stock <= 5 ? "stock-badge low" : "stock-badge";
    badge.textContent = stock <= 5 ? "Stock bajo" : "Disponible";
    top.append(category, badge);

    const name = document.createElement("h3");
    name.textContent = producto.nombre;
    const stockLine = document.createElement("p");
    stockLine.className = "stock-line";
    stockLine.append("Existencias ");
    const stockValue = document.createElement("strong");
    stockValue.textContent = String(stock);
    stockLine.append(stockValue, " unidades");

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      this.createButton("−", "restar", producto.id, "Disminuir existencias"),
      this.createButton("+", "sumar", producto.id, "Aumentar existencias"),
      this.createButton("Eliminar", "eliminar", producto.id, "Eliminar producto", true)
    );

    card.append(top, name, stockLine, actions);
    const style = document.createElement("style");
    style.textContent = `
      :host { display:block; min-width:0; }
      * { box-sizing:border-box; }
      .card { height:100%; padding:16px; border:1px solid #e5ece7; border-radius:13px; background:#fff; }
      .card-top { display:flex; justify-content:space-between; align-items:center; gap:8px; }
      .category { overflow:hidden; color:#63736a; font-size:10px; font-weight:700; letter-spacing:.07em; text-overflow:ellipsis; text-transform:uppercase; white-space:nowrap; }
      .stock-badge { padding:5px 8px; border-radius:20px; color:#1b7653; background:#e8f5ed; font-size:9px; font-weight:700; white-space:nowrap; }
      .stock-badge.low { color:#9c6413; background:#fff2db; }
      h3 { overflow-wrap:anywhere; margin:13px 0 7px; color:#20332b; font:700 15px/1.3 Inter,'Segoe UI',Arial,sans-serif; }
      .stock-line { margin:0 0 15px; color:#7a8981; font:12px Inter,'Segoe UI',Arial,sans-serif; }
      .stock-line strong { color:#263a30; }
      .actions { display:flex; gap:7px; align-items:center; }
      button { min-width:31px; height:30px; padding:0 9px; border:0; border-radius:7px; color:#176b52; background:#eaf4ee; font:700 13px Inter,'Segoe UI',Arial,sans-serif; cursor:pointer; }
      button:hover { background:#dcece2; }
      button:disabled { cursor:not-allowed; opacity:.45; }
      button.delete { margin-left:auto; color:#ad5144; background:#fff0ed; font-size:10px; }
      button.delete:hover { background:#ffe2dc; }
    `;
    this.shadowRoot.replaceChildren(style, card);
    this.disabled = this._disabled;
  }

  createButton(label, action, id, title, danger = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.id = String(id);
    button.title = title;
    button.setAttribute("aria-label", `${title}: ${this._producto.nombre}`);
    if (danger) button.classList.add("delete");
    button.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("producto-accion", {
        bubbles: true,
        composed: true,
        detail: { action, id: Number(id) }
      }));
    });
    return button;
  }
}

customElements.define("producto-card", ProductoCard);
