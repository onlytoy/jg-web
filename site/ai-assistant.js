// Aurora Mobile Japan — AI アシスタント（方案一：右下・3 段階）
//
// ① 読み込みから約 2 秒後（スマートフォンは 3 秒後）、右下に「開いた状態」のカードを出す
// ② ✕ を押すと右下の小さなアイコンに収まる。同じ訪問者には二度と自動で出さない
// ③ カードに入力して Enter → 同じ位置でチャットが開き、入力した文字がそのまま最初の質問になる
//
// 確認用：URL に ?ai=greet を付けると、記憶を無視してカードを出す

(() => {
  const STORAGE_KEY = "aurora-ai-greeted";
  const GREET_DELAY = 2000;
  const GREET_DELAY_MOBILE = 3000;
  const REPLY_DELAY = 700;

  const mobile = window.matchMedia("(max-width: 620px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forceGreet = new URLSearchParams(location.search).get("ai") === "greet";

  // localStorage はプライベートブラウズ等で例外を投げることがある
  const greeted = {
    get() { try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { return false; } },
    set() { try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) { /* 記憶できなくても動作は続ける */ } },
  };

  // ---------------------------------------------------------
  // 仮の応答
  // ※ 公開時は GPTBots.ai の API 呼び出しに差し替えること。
  //   ここではトップページに書いてある内容だけで答える。
  //   サイトに無い情報（料金・規格番号・個別の社名など）は推測で答えず、担当者へつなぐ。
  //   サイト上の AI の回答は「会社の正式な回答」として扱われるため。
  // ---------------------------------------------------------
  const CONTACT = { label: "お問い合わせへ", href: "#contact" };
  const PRODUCTS = { label: "ソリューションを見る", href: "#products" };

  // 上から順に判定する。「製品について相談したい」は「相談」で拾いたいので、製品より先に置く
  const RULES = [
    {
      keys: ["料金", "価格", "費用", "見積", "プラン", "値段"],
      text: "料金はサイトに掲載していません。ご利用規模や必要な機能を伺ったうえで、担当者よりご案内いたします。",
      link: CONTACT,
    },
    {
      keys: ["事例", "実績", "導入企業"],
      text: "導入事例は、このページの「導入事例」で小売・EC、SaaS・テクノロジー、ゲームの 3 件をご紹介しています。個別の企業名や詳しい内容は、担当者よりご案内いたします。",
      link: { label: "導入事例を見る", href: "#stories" },
    },
    {
      keys: ["セキュリティ", "iso", "soc", "認証", "稼働率", "sla"],
      text: "ISO 認証 2 件と SOC 2 の、計 3 件を取得しています。稼働率 SLA は 99.99% です。規格番号などの詳細は、担当者よりご案内いたします。",
      link: { label: "技術と信頼性を見る", href: "#technology" },
    },
    {
      keys: ["サポート", "日本語", "営業時間", "対応時間", "窓口"],
      text: "日本法人（東京）が、契約・お問い合わせの窓口です。サポートは日本語で、平日 9:00 – 18:00 に対応しています。",
      link: CONTACT,
    },
    {
      keys: ["資料", "ダウンロード", "カタログ"],
      text: "製品資料は、こちらからご覧いただけます。",
      link: { label: "資料を見る", href: "#resources" },
    },
    {
      keys: ["相談", "問い合わせ", "問合せ", "担当", "デモ", "連絡"],
      text: "お問い合わせフォームから、担当者へのご相談を承っています。製品デモや導入のご相談も、お気軽にお寄せください。",
      link: CONTACT,
    },
    {
      keys: ["gptbots", "エージェント", "チャットボット"],
      text: "GPTBots.ai は、企業向けの AI エージェント構築プラットフォームです。カスタマーサービス、ナレッジ検索、データ分析、リード獲得などにご活用いただけます。",
      link: PRODUCTS,
    },
    {
      keys: ["engagelab", "エンゲージ", "プッシュ", "配信"],
      text: "EngageLab は、AI エージェント、統合顧客データ、マルチチャネル配信を通じて、顧客関係の構築を支援する顧客エンゲージメントプラットフォームです。",
      link: PRODUCTS,
    },
    {
      keys: ["広告", "ads", "収益化", "マネタイズ"],
      text: "Aurora Ads は、モバイルアプリ開発者向けの広告メディエーション・収益化プラットフォームです。",
      link: PRODUCTS,
    },
    {
      keys: ["フィンテック", "金融", "リスク", "与信"],
      text: "フィンテック事業では、金融機関向けに、リスク管理と、顧客獲得から貸付後モニタリングまでのマーケティングを支援しています。",
      link: PRODUCTS,
    },
    {
      keys: ["製品", "サービス", "ソリューション", "事業", "プロダクト"],
      text: "EngageLab（顧客エンゲージメント）、プログラマティック広告（Aurora Ads）、フィンテック、GPTBots.ai（AI エージェント構築）の 4 つを提供しています。",
      link: PRODUCTS,
    },
    {
      keys: ["会社", "aurora", "オーロラ", "概要", "どんな"],
      text: "Aurora Mobile は、AI・カスタマーエンゲージメント・メッセージング・デベロッパーサービスをひとつのプラットフォームで提供する、グローバル・テクノロジーグループです（NASDAQ: JG）。東京リージョンと国内チームで、日本企業のデジタル成長を支援しています。",
    },
  ];
  const FALLBACK = {
    text: "そのご質問については、サイトに記載がありません。推測でお答えすることは控え、担当者より正確にご回答いたします。",
    link: CONTACT,
  };

  const answer = (question) => {
    const q = question.toLowerCase();
    return RULES.find((rule) => rule.keys.some((key) => q.includes(key))) || FALLBACK;
  };

  // ---------------------------------------------------------
  // 部品
  // ---------------------------------------------------------
  const ICON = {
    close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    minimize: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4 17-6.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.8c-4.9 0-8.8 3.3-8.8 7.4 0 2.2 1.1 4.1 2.9 5.5l-.8 3.6 3.9-2c.9.2 1.8.3 2.8.3 4.9 0 8.8-3.3 8.8-7.4S16.9 3.8 12 3.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m12 7.4.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z" fill="currentColor"/></svg>',
  };
  const AVATAR = '<span class="aia-avatar" aria-hidden="true"><img src="icon/icon1.svg" alt="" /></span>';

  const root = document.createElement("div");
  root.className = "aia";
  root.innerHTML = `
    <aside class="aia-card" aria-label="AIアシスタントのご案内">
      <div class="aia-card-top">
        ${AVATAR}
        <button class="aia-card-resume" type="button" aria-label="AIアシスタントを開く">
          <span class="aia-card-title">Aurora Japanについて、AIに聞いてみませんか？</span>
          <span class="aia-card-sub">会社情報や事業内容、サービス、導入事例など、<span class="aia-nobr">どうぞお気軽に</span>ご質問ください。</span>
        </button>
        <button class="aia-icon-btn aia-card-close" type="button" aria-label="案内を閉じる">${ICON.close}</button>
      </div>
      <form class="aia-form" data-aia-form="card">
        <label class="aia-sr" for="aia-card-input">質問を入力してください</label>
        <input class="aia-input" id="aia-card-input" type="text" autocomplete="off" enterkeyhint="send" placeholder="質問を入力してください…" />
        <button class="aia-send" type="submit" aria-label="質問を送信">${ICON.send}</button>
      </form>
      <p class="aia-powered">Powered by GPTBots.ai</p>
    </aside>

    <button class="aia-launcher" type="button" aria-label="AIアシスタントを開く" aria-expanded="false">${ICON.chat}</button>

    <div class="aia-panel" role="dialog" aria-modal="false" aria-labelledby="aia-panel-title">
      <div class="aia-panel-head">
        ${AVATAR}
        <div class="aia-panel-titles">
          <h2 id="aia-panel-title">Aurora Japan AIアシスタント</h2>
          <p>AIが自動でお答えします</p>
        </div>
        <button class="aia-icon-btn" type="button" data-aia="minimize" aria-label="チャットを最小化" title="最小化">${ICON.minimize}</button>
        <button class="aia-icon-btn" type="button" data-aia="close" aria-label="チャットを閉じる" title="閉じる">${ICON.close}</button>
      </div>
      <div class="aia-log" role="log" aria-live="polite">
        <div class="aia-msg is-bot">お手伝いできることはありますか？</div>
        <div class="aia-msg is-bot">製品情報、導入事例、料金、サポートについてご案内します。知りたいことを入力するか、下の候補から選んでください。</div>
        <div class="aia-quick">
          <button class="aia-chip" type="button" data-aia-q="導入事例を一覧で見たい">導入事例を一覧で見る →</button>
          <button class="aia-chip" type="button" data-aia-q="製品について相談したい">製品について相談する</button>
        </div>
      </div>
      <form class="aia-form" data-aia-form="panel">
        <label class="aia-sr" for="aia-panel-input">チャットに質問を入力</label>
        <input class="aia-input" id="aia-panel-input" type="text" autocomplete="off" enterkeyhint="send" placeholder="質問を入力してください…" />
        <button class="aia-send" type="submit" aria-label="質問を送信">${ICON.send}</button>
      </form>
      <p class="aia-powered">Powered by GPTBots.ai</p>
    </div>
  `;
  document.body.appendChild(root);

  const card = root.querySelector(".aia-card");
  const cardResume = root.querySelector(".aia-card-resume");
  const cardInput = root.querySelector("#aia-card-input");
  const launcher = root.querySelector(".aia-launcher");
  const panel = root.querySelector(".aia-panel");
  const log = root.querySelector(".aia-log");
  const quick = root.querySelector(".aia-quick");
  const panelInput = root.querySelector("#aia-panel-input");

  // 見えていない要素は、フォーカスもスクリーンリーダーも通さない
  const setShown = (el, shown) => {
    el.classList.toggle("is-shown", shown);
    el.inert = !shown;
    el.setAttribute("aria-hidden", String(!shown));
  };
  [card, launcher, panel].forEach((el) => setShown(el, false));

  const isOpen = () => panel.classList.contains("is-shown");
  const scrollLog = () =>
    log.scrollTo({ top: log.scrollHeight, behavior: reduceMotion.matches ? "auto" : "smooth" });

  // ---------------------------------------------------------
  // 状態の切り替え
  // ---------------------------------------------------------
  let greetTimer;
  let replyTimer;

  const showCard = () => {
    if (isOpen()) return;
    setShown(launcher, false);
    setShown(card, true);
    greeted.set();
  };

  // ② ✕：アイコンに収める
  const collapseCard = () => {
    const hadFocus = card.contains(document.activeElement);
    setShown(card, false);
    setShown(launcher, true);
    if (hadFocus) launcher.focus();
  };

  // ③ チャットを開く。question があれば、それを最初の質問として送る
  const openChat = (question = "") => {
    clearTimeout(greetTimer);
    greeted.set();
    setShown(card, false);
    setShown(launcher, false);
    setShown(panel, true);
    launcher.setAttribute("aria-expanded", "true");
    if (question) send(question);
    // スマートフォンでアイコンから開いたときは、いきなりキーボードを出さない
    if (question || !mobile.matches) setTimeout(() => panelInput.focus({ preventScroll: true }), 260);
  };

  const closeChat = ({ restoreFocus = true } = {}) => {
    setShown(panel, false);
    setShown(launcher, true);
    launcher.setAttribute("aria-expanded", "false");
    if (restoreFocus) launcher.focus();
  };

  // 最小化：案内カードの状態に戻す
  const minimizeChat = () => {
    setShown(panel, false);
    launcher.setAttribute("aria-expanded", "false");
    setShown(card, true);
    cardResume.focus();
  };

  const addMessage = (role) => {
    const node = document.createElement("div");
    node.className = `aia-msg ${role} is-new`;
    log.insertBefore(node, quick);
    return node;
  };

  const renderReply = (node, reply) => {
    node.textContent = reply.text;
    if (!reply.link) return;
    const row = document.createElement("span");
    row.className = "aia-link-row";
    const a = document.createElement("a");
    a.className = "aia-link";
    a.href = reply.link.href;
    a.textContent = reply.link.label + " ";
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    a.appendChild(arrow);
    row.appendChild(a);
    node.appendChild(row);
  };

  const send = (raw) => {
    const question = raw.trim();
    if (!question) return;
    addMessage("is-user").textContent = question;
    panelInput.value = "";
    const pending = addMessage("is-bot");
    pending.innerHTML = '<span class="aia-typing" aria-label="回答を作成中"><i></i><i></i><i></i></span>';
    scrollLog();
    clearTimeout(replyTimer);
    replyTimer = setTimeout(() => {
      renderReply(pending, answer(question));
      scrollLog();
    }, REPLY_DELAY);
  };

  // ---------------------------------------------------------
  // イベント
  // ---------------------------------------------------------
  root.querySelector(".aia-card-close").addEventListener("click", collapseCard);
  cardResume.addEventListener("click", () => openChat());
  launcher.addEventListener("click", () => openChat());
  panel.querySelector('[data-aia="minimize"]').addEventListener("click", minimizeChat);
  panel.querySelector('[data-aia="close"]').addEventListener("click", () => closeChat());

  root.querySelector('[data-aia-form="card"]').addEventListener("submit", (e) => {
    e.preventDefault();
    const question = cardInput.value;
    cardInput.value = "";
    openChat(question.trim() || "Auroraについて教えてください");
  });

  root.querySelector('[data-aia-form="panel"]').addEventListener("submit", (e) => {
    e.preventDefault();
    send(panelInput.value);
  });

  log.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-aia-q]");
    if (chip) {
      send(chip.dataset.aiaQ);
      return;
    }
    // スマートフォンではチャットが画面を覆うので、ページ内リンクを押したら閉じて行き先を見せる
    if (e.target.closest(".aia-link") && mobile.matches) closeChat({ restoreFocus: false });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isOpen()) closeChat();
    else if (card.classList.contains("is-shown") && card.contains(document.activeElement)) collapseCard();
  });

  // ---------------------------------------------------------
  // 起動
  // ---------------------------------------------------------
  if (greeted.get() && !forceGreet) {
    setShown(launcher, true);
  } else {
    greetTimer = setTimeout(showCard, mobile.matches ? GREET_DELAY_MOBILE : GREET_DELAY);
  }
})();
