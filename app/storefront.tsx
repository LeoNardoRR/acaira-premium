"use client";

import {
  ArrowLeft, ArrowRight, BarChart3, Check, ChevronDown, Clock3, CreditCard,
  Camera, Leaf, MapPin, Menu, Minus, Package, Phone, Plus, Search, ShoppingBag,
  Sparkles, Star, Trash2, Truck, Users, WalletCards, X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CartItem, Category, Product, money, products as seedProducts } from "./data";
import { useClientPathname } from "../lib/use-client-pathname";

const nav = [
  ["/", "Home"], ["/cardapio", "Cardápio"], ["/sobre", "Sobre"], ["/contato", "Contato"],
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export function Storefront() {
  const pathname = useClientPathname();
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = window.sessionStorage.getItem("acaira-cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);
  useEffect(() => {
    if (!window.location.hostname.endsWith("github.io")) return;
    const navigate = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      const href = anchor?.getAttribute("href");
      if (!href?.startsWith("/") || anchor?.target === "_blank") return;
      event.preventDefault();
      window.location.hash = href === "/" ? "/" : href;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    document.addEventListener("click", navigate);
    return () => document.removeEventListener("click", navigate);
  }, []);
  useEffect(() => {
    window.sessionStorage.setItem("acaira-cart", JSON.stringify(cart));
  }, [cart]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product: Product, size = "500ml") {
    setCart((items) => {
      const found = items.find((item) => item.id === product.id && item.size === size);
      if (found) return items.map((item) => item === found ? { ...item, quantity: item.quantity + 1 } : item);
      return [...items, { ...product, size, quantity: 1 }];
    });
    setToast(`${product.name} foi para a sacola`);
    window.setTimeout(() => setToast(""), 2600);
  }

  function changeQty(id: string, size: string, delta: number) {
    setCart((items) => items
      .map((item) => item.id === id && item.size === size ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  }

  let content;
  if (pathname === "/cardapio") content = <MenuPage products={products} addToCart={addToCart} />;
  else if (pathname.startsWith("/produto/")) {
    const product = products.find((item) => item.id === pathname.split("/").pop()) || products[0];
    content = <ProductPage product={product} addToCart={addToCart} />;
  } else if (pathname === "/carrinho") {
    content = <CartPage cart={cart} subtotal={subtotal} changeQty={changeQty} />;
  } else if (pathname === "/checkout") {
    content = <CheckoutPage cart={cart} subtotal={subtotal} clearCart={() => setCart([])} />;
  } else if (pathname === "/sobre") content = <AboutPage />;
  else if (pathname === "/contato") content = <ContactPage />;
  else if (pathname.startsWith("/admin")) {
    content = <AdminPage products={products} setProducts={setProducts} />;
  } else content = <HomePage products={products} addToCart={addToCart} />;

  const admin = pathname.startsWith("/admin");
  return (
    <div className="site-shell">
      {!admin && (
        <>
          <div className="announcement"><Sparkles size={14} /> Entrega grátis acima de R$ 60 <span>•</span> Peça até 22h</div>
          <header className="header">
            <a href="/" className="brand" aria-label="Açaíra - Página inicial">
              <span className="brand-mark">A</span><span>AÇAÍRA<small>feito de verdade</small></span>
            </a>
            <nav className={cx("nav", menuOpen && "nav-open")}>
              {nav.map(([href, label]) => <a key={href} href={href} className={pathname === href ? "active" : ""}>{label}</a>)}
              <a href="/admin">Admin</a>
            </nav>
            <div className="header-actions">
              <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
                {menuOpen ? <X /> : <Menu />}
              </button>
              <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Sacola com ${totalItems} itens`}>
                <ShoppingBag size={19} /> <span>Sacola</span>{totalItems > 0 && <b>{totalItems}</b>}
              </button>
            </div>
          </header>
        </>
      )}
      <main>{content}</main>
      {!admin && <Footer />}
      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head"><div><small>SUA SACOLA</small><h2>{totalItems} {totalItems === 1 ? "item" : "itens"}</h2></div><button className="icon-button" onClick={() => setCartOpen(false)}><X /></button></div>
            <div className="drawer-items">
              {cart.length === 0 ? <EmptyCart /> : cart.map((item) => (
                <div className="cart-line" key={`${item.id}-${item.size}`}>
                  <img src={item.image} alt="" />
                  <div className="cart-info"><b>{item.name}</b><small>{item.size}</small><strong>{money(item.price)}</strong></div>
                  <div className="qty"><button onClick={() => changeQty(item.id, item.size, -1)}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => changeQty(item.id, item.size, 1)}><Plus size={14} /></button></div>
                </div>
              ))}
            </div>
            {cart.length > 0 && <div className="drawer-total"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><small>Taxa de entrega calculada no checkout</small><a className="btn btn-primary btn-wide" href="/checkout">Finalizar pedido <ArrowRight size={18} /></a><a href="/carrinho" className="text-link">Ver sacola completa</a></div>}
          </aside>
        </div>
      )}
      {toast && <div className="toast"><Check size={18} /> {toast}</div>}
    </div>
  );
}

function HomePage({ products, addToCart }: { products: Product[]; addToCart: (p: Product) => void }) {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Leaf size={15} /> PURO, CREMOSO, INESQUECÍVEL</div>
        <h1>Seu momento<br /><em>mais gostoso.</em></h1>
        <p>Açaí de verdade, frutas frescas e combinações que transformam qualquer pausa no melhor momento do dia.</p>
        <div className="hero-actions"><a className="btn btn-primary" href="/cardapio">Explorar cardápio <ArrowRight size={18} /></a><a className="btn btn-ghost" href="#favoritos">Ver favoritos</a></div>
        <div className="social-proof"><div className="avatars"><span>AM</span><span>JL</span><span>BC</span></div><div><div className="stars">★★★★★ <b>4.9</b></div><small>+2.400 clientes felizes</small></div></div>
      </div>
      <div className="hero-visual">
        <div className="hero-orb"></div>
        <img src={products[0].image} alt="Bowl premium de açaí com frutas frescas" />
        <div className="floating-card fc-top"><span>100%</span><div><b>Frutas frescas</b><small>Selecionadas todo dia</small></div></div>
        <div className="floating-card fc-bottom"><span className="mini-rating">★ 4.9</span><div><b>Favorito da galera</b><small>Açaí Clássico</small></div></div>
      </div>
    </section>
    <section className="trust-strip"><div><Leaf /><span><b>Açaí premium</b><small>Sem xarope artificial</small></span></div><div><Clock3 /><span><b>Preparo rápido</b><small>Em média 15 minutos</small></span></div><div><Truck /><span><b>Entrega segura</b><small>Bem embalado até você</small></span></div><div><Star /><span><b>Feito com carinho</b><small>Em cada detalhe</small></span></div></section>
    <section className="section" id="favoritos">
      <SectionHeading eyebrow="OS QUERIDINHOS" title="Difícil escolher só um." description="Combinações pensadas para todos os momentos — do clássico ao surpreendente." action={<a href="/cardapio">Ver cardápio completo <ArrowRight size={16} /></a>} />
      <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}</div>
    </section>
    <section className="build-banner"><div><span className="eyebrow light">DO SEU JEITO</span><h2>Monte. Misture.<br />Se apaixone.</h2><p>Escolha o tamanho, a base e seus complementos favoritos. Aqui, cada bowl tem a sua assinatura.</p><a className="btn btn-light" href="/produto/acai-classico">Montar meu açaí <ArrowRight size={18} /></a></div><div className="ingredients-cloud"><span>🍓</span><span>🥝</span><span>🍌</span><span>🥥</span><b>+12<br /><small>complementos</small></b></div></section>
    <section className="section testimonials"><SectionHeading eyebrow="QUEM PROVA, AMA" title="Amor à primeira colherada." />
      <div className="quote-grid">{[
        ["“O açaí é muito cremoso e os complementos chegam super frescos. Virou meu pedido oficial de domingo!”", "Marina Costa", "Cliente desde 2022"],
        ["“Finalmente um açaí que não é só açúcar. O Power Protein é perfeito depois do treino.”", "Pedro Lima", "Cliente verificado"],
        ["“Embalagem linda, entrega rápida e sabor impecável. Experiência premium de verdade.”", "Clara Nunes", "Cliente verificada"],
      ].map(([quote, name, role]) => <article className="quote-card" key={name}><div className="stars">★★★★★</div><p>{quote}</p><div><span>{name.slice(0, 1)}</span><b>{name}<small>{role}</small></b></div></article>)}</div>
    </section>
    <section className="app-banner"><div><small>PRIMEIRO PEDIDO</small><h2>Ganhe 15% OFF</h2><p>Use o cupom <b>BEMVINDO15</b> e transforme sua primeira colherada em um momento ainda melhor.</p></div><a className="btn btn-primary" href="/cardapio">Quero meu desconto <ArrowRight size={18} /></a></section>
  </>;
}

function MenuPage({ products, addToCart }: { products: Product[]; addToCart: (p: Product) => void }) {
  const [category, setCategory] = useState<"Todos" | Category>("Todos");
  const [query, setQuery] = useState("");
  const visible = products.filter((p) => (category === "Todos" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-wrap">
    <section className="page-hero compact"><span className="eyebrow">NOSSO CARDÁPIO</span><h1>Feito para dar vontade.</h1><p>Ingredientes frescos, receitas exclusivas e liberdade para montar do seu jeito.</p></section>
    <div className="menu-toolbar"><div className="category-pills">{(["Todos", "Açaí", "Bowls", "Bebidas", "Combos"] as const).map((item) => <button className={category === item ? "selected" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><label className="search"><Search size={17} /><input placeholder="Buscar no cardápio" value={query} onChange={(e) => setQuery(e.target.value)} /></label></div>
    <div className="menu-title"><div><small>{category === "Todos" ? "TODAS AS DELÍCIAS" : category.toUpperCase()}</small><h2>{visible.length} opções para você</h2></div><button className="sort">Mais populares <ChevronDown size={15} /></button></div>
    <div className="product-grid menu-grid">{visible.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}</div>
    {visible.length === 0 && <div className="empty-state"><Search size={36} /><h3>Nenhum sabor encontrado</h3><p>Tente buscar por outro nome.</p></div>}
  </div>;
}

function ProductCard({ product, addToCart }: { product: Product; addToCart: (p: Product) => void }) {
  return <article className="product-card">
    <a href={`/produto/${product.id}`} className="product-image"><img src={product.image} alt={product.name} />{product.badge && <span>{product.badge}</span>}<small><Star size={12} fill="currentColor" /> {product.rating}</small></a>
    <div className="product-body"><span>{product.category}</span><a href={`/produto/${product.id}`}><h3>{product.name}</h3></a><p>{product.description}</p><div><strong>{money(product.price)}</strong><button onClick={() => addToCart(product)} aria-label={`Adicionar ${product.name}`}><Plus /></button></div></div>
  </article>;
}

function ProductPage({ product, addToCart }: { product: Product; addToCart: (p: Product, size?: string) => void }) {
  const [size, setSize] = useState("500ml");
  const [extras, setExtras] = useState<string[]>(["Granola"]);
  const sizePrice = size === "700ml" ? 8 : size === "300ml" ? -5 : 0;
  const extraPrice = extras.length * 2.5;
  const toggle = (extra: string) => setExtras((items) => items.includes(extra) ? items.filter((i) => i !== extra) : [...items, extra]);
  return <div className="product-page page-wrap">
    <a className="back-link" href="/cardapio"><ArrowLeft size={16} /> Voltar ao cardápio</a>
    <div className="product-detail">
      <div className="detail-image"><img src={product.image} alt={product.name} /><span>{product.badge || "Feito na hora"}</span></div>
      <div className="detail-copy"><div className="eyebrow">{product.category} · <Star size={13} fill="currentColor" /> {product.rating}</div><h1>{product.name}</h1><p>{product.description} Uma combinação equilibrada, preparada na hora com ingredientes selecionados.</p><div className="detail-meta"><span><Clock3 /> {product.prep}</span><span><Leaf /> Ingredientes frescos</span></div>
        <fieldset><legend>Escolha o tamanho <small>Obrigatório</small></legend><div className="size-grid">{[["300ml", "Individual", -5], ["500ml", "Na medida", 0], ["700ml", "Para aproveitar", 8]].map(([value, label, delta]) => <button type="button" onClick={() => setSize(String(value))} className={size === value ? "selected" : ""} key={String(value)}><b>{value}</b><small>{label}</small><span>{Number(delta) === 0 ? "Incluso" : `${Number(delta) > 0 ? "+" : ""}${money(Number(delta))}`}</span></button>)}</div></fieldset>
        <fieldset><legend>Complete seu momento <small>Até 4 itens</small></legend><div className="extras">{["Granola", "Morango", "Banana", "Leite em pó", "Paçoca", "Nutella"].map((extra) => <label key={extra}><input type="checkbox" checked={extras.includes(extra)} onChange={() => toggle(extra)} disabled={!extras.includes(extra) && extras.length >= 4} /><span>{extra}</span><b>+ R$ 2,50</b></label>)}</div></fieldset>
        <button className="btn btn-primary btn-wide add-detail" onClick={() => addToCart({ ...product, price: product.price + sizePrice + extraPrice }, size)}><ShoppingBag size={18} /> Adicionar à sacola <b>{money(product.price + sizePrice + extraPrice)}</b></button>
      </div>
    </div>
  </div>;
}

function CartPage({ cart, subtotal, changeQty }: { cart: CartItem[]; subtotal: number; changeQty: (id: string, size: string, delta: number) => void }) {
  if (!cart.length) return <div className="page-wrap cart-empty-page"><EmptyCart /><a className="btn btn-primary" href="/cardapio">Explorar cardápio</a></div>;
  return <div className="page-wrap cart-page"><div className="page-title"><span className="eyebrow">SUA ESCOLHA</span><h1>Minha sacola</h1><p>Revise os itens antes de finalizar seu pedido.</p></div><div className="cart-layout"><div className="cart-list">{cart.map((item) => <div className="cart-row" key={`${item.id}-${item.size}`}><img src={item.image} alt="" /><div><small>{item.category}</small><h3>{item.name}</h3><span>{item.size}</span><button onClick={() => changeQty(item.id, item.size, -item.quantity)}><Trash2 size={14} /> Remover</button></div><div className="qty"><button onClick={() => changeQty(item.id, item.size, -1)}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => changeQty(item.id, item.size, 1)}><Plus size={14} /></button></div><b>{money(item.price * item.quantity)}</b></div>)}</div><OrderSummary subtotal={subtotal} /></div></div>;
}

function OrderSummary({ subtotal }: { subtotal: number }) {
  const delivery = subtotal >= 60 ? 0 : 7.9;
  return <aside className="order-summary"><h2>Resumo</h2><label className="coupon"><input placeholder="Cupom de desconto" /><button>Aplicar</button></label><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Entrega</span><b className={delivery === 0 ? "success" : ""}>{delivery === 0 ? "Grátis" : money(delivery)}</b></div><div className="grand-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><a className="btn btn-primary btn-wide" href="/checkout">Ir para checkout <ArrowRight size={18} /></a><small><Check /> Compra segura e pagamento protegido</small></aside>;
}

function CheckoutPage({ cart, subtotal, clearCart }: { cart: CartItem[]; subtotal: number; clearCart: () => void }) {
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true);
    window.setTimeout(() => { setLoading(false); setDone(true); clearCart(); }, 1200);
  }
  if (done) return <div className="success-page"><div className="success-check"><Check /></div><span className="eyebrow">PEDIDO CONFIRMADO</span><h1>Agora é só esperar a delícia chegar.</h1><p>Pedido <b>#AÇR-1048</b> recebido e já enviado para a cozinha. Você receberá atualizações por WhatsApp.</p><div className="order-status"><span className="active"><b>1</b>Confirmado</span><i></i><span><b>2</b>Preparando</span><i></i><span><b>3</b>Saiu</span></div><a className="btn btn-primary" href="/">Voltar para o início</a></div>;
  if (!cart.length) return <div className="page-wrap cart-empty-page"><EmptyCart /><a className="btn btn-primary" href="/cardapio">Escolher meu açaí</a></div>;
  const delivery = subtotal >= 60 ? 0 : 7.9;
  return <div className="checkout-page page-wrap"><a className="back-link" href="/carrinho"><ArrowLeft size={16} /> Voltar para a sacola</a><div className="checkout-title"><div><span className="eyebrow">QUASE LÁ</span><h1>Finalizar pedido</h1></div><div className="secure"><Check /> Ambiente seguro</div></div><form onSubmit={submit} className="checkout-layout"><div className="checkout-forms">
    <section className="form-card"><div className="form-number">1</div><div className="form-content"><h2>Seus dados</h2><p>Usaremos essas informações para atualizar seu pedido.</p><div className="field-grid"><label>Nome completo<input required placeholder="Como podemos te chamar?" /></label><label>WhatsApp<input required placeholder="(11) 99999-9999" /></label><label className="full">E-mail<input required type="email" placeholder="voce@email.com" /></label></div></div></section>
    <section className="form-card"><div className="form-number">2</div><div className="form-content"><h2>Endereço de entrega</h2><p>Confira se todos os dados estão corretos.</p><div className="field-grid"><label>CEP<input required placeholder="00000-000" /></label><label>Rua<input required placeholder="Nome da rua" /></label><label>Número<input required placeholder="123" /></label><label>Complemento<input placeholder="Apto, bloco..." /></label><label className="full">Bairro<input required placeholder="Seu bairro" /></label></div></div></section>
    <section className="form-card"><div className="form-number">3</div><div className="form-content"><h2>Pagamento</h2><p>Escolha como prefere pagar.</p><div className="payment-tabs"><button type="button" onClick={() => setMethod("pix")} className={method === "pix" ? "selected" : ""}><span className="pix-symbol">◇</span><b>Pix<small>5% de desconto</small></b>{method === "pix" && <Check />}</button><button type="button" onClick={() => setMethod("card")} className={method === "card" ? "selected" : ""}><CreditCard /><b>Cartão<small>Crédito ou débito</small></b>{method === "card" && <Check />}</button></div>{method === "pix" ? <div className="payment-note"><Sparkles /><span><b>Pagamento rápido com Pix</b><small>O QR Code será exibido após confirmar o pedido. Aprovação imediata.</small></span></div> : <div className="field-grid card-fields"><label className="full">Número do cartão<input required placeholder="0000 0000 0000 0000" /></label><label>Validade<input required placeholder="MM/AA" /></label><label>CVV<input required placeholder="123" /></label><label className="full">Nome impresso<input required placeholder="NOME NO CARTÃO" /></label></div>}</div></section>
  </div><aside className="checkout-summary"><h2>Seu pedido</h2>{cart.map((item) => <div className="summary-item" key={`${item.id}-${item.size}`}><img src={item.image} alt="" /><span><b>{item.quantity}× {item.name}</b><small>{item.size}</small></span><strong>{money(item.price * item.quantity)}</strong></div>)}<hr /><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Entrega</span><b>{delivery ? money(delivery) : "Grátis"}</b></div><div><span>Desconto Pix</span><b className="success">{method === "pix" ? `− ${money(subtotal * .05)}` : "—"}</b></div><div className="grand-total"><span>Total</span><strong>{money(subtotal + delivery - (method === "pix" ? subtotal * .05 : 0))}</strong></div><button className="btn btn-primary btn-wide" disabled={loading}>{loading ? "Processando..." : `Confirmar e pagar com ${method === "pix" ? "Pix" : "cartão"}`} <ArrowRight size={18} /></button><small className="legal">Ao confirmar, você concorda com nossos termos e política de privacidade.</small></aside></form></div>;
}

function AboutPage() {
  return <><section className="about-hero"><div><span className="eyebrow light">NOSSA ESSÊNCIA</span><h1>A Amazônia<br />em cada colher.</h1><p>Nascemos de uma vontade simples: servir açaí de verdade, com respeito à origem, aos ingredientes e às pessoas.</p></div><img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85" alt="Equipe Açaíra" /></section><section className="story section"><div><span className="eyebrow">DESDE 2019</span><h2>Uma história feita de sabor e propósito.</h2></div><div><p>A Açaíra começou pequena, em uma cozinha de bairro, com a certeza de que o açaí poderia ser mais: mais puro, mais bonito, mais responsável e muito mais gostoso.</p><p>Hoje, cada pedido carrega a mesma atenção do primeiro bowl. Trabalhamos com fornecedores responsáveis, frutas escolhidas diariamente e uma equipe apaixonada por criar bons momentos.</p></div></section><section className="values"><div><Leaf /><b>Origem responsável</b><p>Açaí rastreável e fornecedores que respeitam a floresta.</p></div><div><Sparkles /><b>Qualidade real</b><p>Ingredientes selecionados e receitas sem atalhos.</p></div><div><Users /><b>Gente que cuida</b><p>Da nossa equipe até o último detalhe da entrega.</p></div></section><section className="numbers section"><div><strong>+48 mil</strong><span>bowls servidos</span></div><div><strong>4.9/5</strong><span>avaliação média</span></div><div><strong>18</strong><span>parceiros locais</span></div><div><strong>92%</strong><span>embalagens recicláveis</span></div></section></>;
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  return <div className="contact-page page-wrap"><div className="contact-copy"><span className="eyebrow">FALE COM A GENTE</span><h1>Adoramos uma boa conversa.</h1><p>Dúvida, elogio ou sugestão? Nossa equipe responde rapidinho.</p><div className="contact-cards"><div><Phone /><span><small>WHATSAPP</small><b>(11) 99942-2024</b><em>Seg–Dom, 10h às 22h</em></span></div><div><MapPin /><span><small>NOSSA LOJA</small><b>Rua das Palmeiras, 284</b><em>Vila Madalena · São Paulo</em></span></div><div><Camera /><span><small>INSTAGRAM</small><b>@acaira.oficial</b><em>Acompanhe os bastidores</em></span></div></div></div><form className="contact-form" onSubmit={(e) => {e.preventDefault(); setSent(true);}}>{sent ? <div className="form-sent"><Check /><h2>Mensagem enviada!</h2><p>Obrigada pelo contato. Respondemos em até 1 dia útil.</p></div> : <><h2>Envie uma mensagem</h2><label>Nome<input required placeholder="Seu nome" /></label><label>E-mail<input required type="email" placeholder="voce@email.com" /></label><label>Assunto<select><option>Dúvida sobre pedido</option><option>Elogio ou sugestão</option><option>Parcerias</option></select></label><label>Mensagem<textarea required placeholder="Conte pra gente..." rows={5} /></label><button className="btn btn-primary">Enviar mensagem <ArrowRight size={18} /></button></>}</form></div>;
}

type AdminOrder = { id: string; customer: string; items: number; total: number; status: string; time: string };
const seedOrders: AdminOrder[] = [
  { id: "#1048", customer: "Marina Costa", items: 2, total: 62.8, status: "Preparando", time: "12:42" },
  { id: "#1047", customer: "João Martins", items: 1, total: 31.9, status: "Novo", time: "12:38" },
  { id: "#1046", customer: "Clara Nunes", items: 3, total: 87.7, status: "Saiu p/ entrega", time: "12:21" },
  { id: "#1045", customer: "Pedro Lima", items: 2, total: 54.9, status: "Entregue", time: "11:56" },
];

function AdminPage({ products, setProducts }: { products: Product[]; setProducts: (p: Product[]) => void }) {
  const pathname = useClientPathname();
  const [orders, setOrders] = useState(seedOrders);
  const [modal, setModal] = useState<null | Partial<Product>>(null);
  const section = pathname.includes("/produtos") ? "products" : pathname.includes("/pedidos") ? "orders" : "dashboard";
  const navItems = [{ href: "/admin", label: "Visão geral", icon: BarChart3 }, { href: "/admin/pedidos", label: "Pedidos", icon: Package }, { href: "/admin/produtos", label: "Produtos", icon: ShoppingBag }];
  function saveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const item: Product = {
      id: String(modal?.id || fd.get("name")).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"),
      name: String(fd.get("name")), category: String(fd.get("category")) as Category,
      description: String(fd.get("description")), price: Number(fd.get("price")),
      image: String(fd.get("image")) || seedProducts[0].image, rating: modal?.rating || 5, prep: "15–20 min", badge: String(fd.get("badge") || ""),
    };
    setProducts(modal?.id ? products.map((p) => p.id === modal.id ? item : p) : [...products, item]); setModal(null);
  }
  return <div className="admin-shell"><aside className="admin-sidebar"><a href="/" className="brand admin-brand"><span className="brand-mark">A</span><span>AÇAÍRA<small>PAINEL ADMIN</small></span></a><nav>{navItems.map((item) => <a href={item.href} className={(section === "dashboard" ? pathname === "/admin" : pathname.includes(item.href)) ? "active" : ""} key={item.href}><item.icon size={19} /> {item.label}{item.label === "Pedidos" && <b>3</b>}</a>)}</nav><div className="admin-help"><Sparkles /><b>Precisa de ajuda?</b><small>Fale com nosso suporte.</small><button>Chamar suporte</button></div><a className="admin-exit" href="/"><ArrowLeft /> Voltar para a loja</a></aside><main className="admin-main"><header className="admin-top"><div><small>Terça-feira, 29 de julho</small><h1>{section === "dashboard" ? "Olá, Leonardo 👋" : section === "products" ? "Produtos" : "Pedidos"}</h1></div><div className="admin-user"><span>LR</span><b>Leonardo<small>Administrador</small></b><ChevronDown /></div></header>
    {section === "dashboard" && <Dashboard orders={orders} />}
    {section === "orders" && <OrdersTable orders={orders} setOrders={setOrders} />}
    {section === "products" && <ProductsAdmin products={products} setProducts={setProducts} openModal={setModal} />}
  </main>{modal && <div className="modal-backdrop"><form className="product-modal" onSubmit={saveProduct}><div className="modal-head"><div><small>CATÁLOGO</small><h2>{modal.id ? "Editar produto" : "Novo produto"}</h2></div><button type="button" onClick={() => setModal(null)}><X /></button></div><label>Nome<input name="name" defaultValue={modal.name} required /></label><div className="field-grid"><label>Categoria<select name="category" defaultValue={modal.category || "Açaí"}><option>Açaí</option><option>Bowls</option><option>Bebidas</option><option>Combos</option></select></label><label>Preço<input name="price" type="number" step="0.01" defaultValue={modal.price} required /></label></div><label>Descrição<textarea name="description" rows={3} defaultValue={modal.description} required /></label><label>URL da imagem<input name="image" defaultValue={modal.image} placeholder="https://..." /></label><label>Selo opcional<input name="badge" defaultValue={modal.badge} placeholder="Ex: Mais pedido" /></label><div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary">Salvar produto</button></div></form></div>}</div>;
}

function Dashboard({ orders }: { orders: AdminOrder[] }) {
  return <><div className="admin-kpis"><div><span className="kpi-icon purple"><WalletCards /></span><small>VENDAS HOJE</small><strong>R$ 2.847,90</strong><em>↗ 12,5% <i>vs. ontem</i></em></div><div><span className="kpi-icon lime"><Package /></span><small>PEDIDOS</small><strong>48</strong><em>↗ 8,2% <i>vs. ontem</i></em></div><div><span className="kpi-icon orange"><Clock3 /></span><small>TICKET MÉDIO</small><strong>R$ 59,33</strong><em>↗ 3,1% <i>vs. ontem</i></em></div><div><span className="kpi-icon blue"><Users /></span><small>NOVOS CLIENTES</small><strong>16</strong><em>↗ 14,3% <i>esta semana</i></em></div></div><div className="admin-grid"><section className="chart-card"><div className="card-head"><div><h2>Visão de vendas</h2><p>Faturamento dos últimos 7 dias</p></div><button>Últimos 7 dias <ChevronDown /></button></div><div className="chart"><div className="chart-y"><span>3k</span><span>2k</span><span>1k</span><span>0</span></div><div className="bars">{[48, 63, 45, 78, 66, 91, 74].map((height, i) => <div key={i}><span style={{ height: `${height}%` }}></span><small>{["Qua", "Qui", "Sex", "Sáb", "Dom", "Seg", "Ter"][i]}</small></div>)}</div></div></section><section className="status-card"><div className="card-head"><div><h2>Pedidos por status</h2><p>Atualização em tempo real</p></div></div>{[["Novos", 8, "purple"], ["Preparando", 12, "orange"], ["Em entrega", 6, "blue"], ["Concluídos", 22, "green"]].map(([name, count, color]) => <div className="status-row" key={String(name)}><span><i className={String(color)}></i>{name}</span><b>{count}</b><div><i className={String(color)} style={{ width: `${Number(count) * 4}%` }}></i></div></div>)}</section></div><section className="table-card"><div className="card-head"><div><h2>Pedidos recentes</h2><p>Acompanhe os pedidos em andamento</p></div><a href="/admin/pedidos">Ver todos <ArrowRight /></a></div><OrdersTable orders={orders} compact /></section></>;
}

function OrdersTable({ orders, setOrders, compact }: { orders: AdminOrder[]; setOrders?: (o: AdminOrder[]) => void; compact?: boolean }) {
  const change = (id: string, status: string) => setOrders?.(orders.map((o) => o.id === id ? { ...o, status } : o));
  return <div className={compact ? "" : "table-card full-table"}>{!compact && <div className="table-tools"><label className="search"><Search /><input placeholder="Buscar pedido ou cliente" /></label><select><option>Todos os status</option><option>Novo</option><option>Preparando</option><option>Entregue</option></select></div>}<div className="data-table"><div className="table-row table-header"><span>PEDIDO</span><span>CLIENTE</span><span>ITENS</span><span>TOTAL</span><span>STATUS</span><span>HORÁRIO</span></div>{orders.map((order) => <div className="table-row" key={order.id}><b>{order.id}</b><span className="customer"><i>{order.customer[0]}</i>{order.customer}</span><span>{order.items} itens</span><b>{money(order.total)}</b><span>{setOrders ? <select value={order.status} onChange={(e) => change(order.id, e.target.value)} className={`status-pill ${order.status.toLowerCase().replaceAll(" ", "-")}`}><option>Novo</option><option>Preparando</option><option>Saiu p/ entrega</option><option>Entregue</option></select> : <i className={`status-pill ${order.status.toLowerCase().replaceAll(" ", "-")}`}>{order.status}</i>}</span><span>{order.time}</span></div>)}</div></div>;
}

function ProductsAdmin({ products, setProducts, openModal }: { products: Product[]; setProducts: (p: Product[]) => void; openModal: (p: Partial<Product>) => void }) {
  return <section className="table-card full-table"><div className="table-tools"><label className="search"><Search /><input placeholder="Buscar produto" /></label><button className="btn btn-primary" onClick={() => openModal({})}><Plus /> Novo produto</button></div><div className="data-table product-table"><div className="table-row table-header"><span>PRODUTO</span><span>CATEGORIA</span><span>PREÇO</span><span>AVALIAÇÃO</span><span>STATUS</span><span>AÇÕES</span></div>{products.map((product) => <div className="table-row" key={product.id}><span className="product-cell"><img src={product.image} alt="" /><b>{product.name}<small>{product.description.slice(0, 35)}…</small></b></span><span>{product.category}</span><b>{money(product.price)}</b><span>★ {product.rating}</span><i className="status-pill entregue">Ativo</i><span className="row-actions"><button onClick={() => openModal(product)}>Editar</button><button onClick={() => setProducts(products.filter((p) => p.id !== product.id))}><Trash2 /></button></span></div>)}</div></section>;
}

function EmptyCart() { return <div className="empty-cart"><span><ShoppingBag /></span><h3>Sua sacola está vazia</h3><p>Que tal escolher algo delicioso?</p></div>; }
function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>; }
function Footer() { return <footer><div className="footer-main"><div><a href="/" className="brand brand-light"><span className="brand-mark">A</span><span>AÇAÍRA<small>feito de verdade</small></span></a><p>Açaí premium, frutas frescas e bons momentos — entregues até você.</p><div className="socials"><a href="#" aria-label="Instagram"><Camera /></a><a href="#" aria-label="WhatsApp"><Phone /></a></div></div><div><b>Explore</b><a href="/">Home</a><a href="/cardapio">Cardápio</a><a href="/sobre">Nossa história</a></div><div><b>Ajuda</b><a href="/contato">Fale conosco</a><a href="#">Entrega e prazos</a><a href="#">Política de privacidade</a></div><div><b>Horários</b><span>Segunda a domingo</span><strong>10h — 22h</strong><span>Vila Madalena · SP</span></div></div><div className="footer-bottom"><span>© 2026 Açaíra. Todos os direitos reservados.</span><span>Feito com 💜 e açaí.</span></div></footer>; }
