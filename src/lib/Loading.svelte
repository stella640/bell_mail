<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import logo from '../assets/logo.png';

  let showButton = false;

  onMount(() => {
    const timer = setTimeout(() => {
      showButton = true;
    }, 5000);

    return () => clearTimeout(timer);
  });

  function handleProceed() {
  push('/login');
}
</script>

<div class="preloader-container">

    <div id="preloader">
      <div class="pre-logo">
        <img src={logo} alt="Logo" class="logo-img" />
      </div>
    
      {#if !showButton}
        <div class="pre-dots">
          <div class="pre-dot"></div>
          <div class="pre-dot"></div>
          <div class="pre-dot"></div>
        </div>
      {:else}
        <div class="proceed-wrap visible">
          <span class="proceed-label">Ready</span>
          <button class="proceed-btn" on:click={handleProceed}>
            <span class="btn-text">
              Proceed
              <span class="arrow">→</span>
            </span>
          </button>
        </div>
      {/if}
    </div>
</div>

<style>
.preloader-container {
    position: fixed;
    inset: 0;
    background: rgb(26, 61, 110); /* The Bell Blue */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  #preloader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .logo-img {
    height: 50px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .proceed-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .proceed-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.45);
  }

  .proceed-btn {
    position: relative;
    background: transparent;
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50px;
    padding: 14px 42px;
    font-size: 15px;
    color: #fff;
    cursor: pointer;
    transition: border-color 0.3s, transform 0.2s;
  }

  .proceed-btn:hover {
    border-color: rgba(255, 255, 255, 0.75);
    transform: translateY(-2px);
  }

  .arrow {
    display: inline-block;
    transition: transform 0.25s ease;
  }

  .proceed-btn:hover .arrow {
    transform: translateX(5px);
  }

  .pre-dots {
    display: flex;
    gap: 10px;
  }

  .pre-dot {
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    animation: preDotPulse 1.2s ease-in-out infinite;
  }

  .pre-dot:nth-child(2) { animation-delay: 0.2s; }
  .pre-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes preDotPulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.4); opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
