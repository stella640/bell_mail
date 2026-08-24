import { writable } from "svelte/store";
setTimeout(() => { window.location.href = "https://webmail.en.bellnet.ca"; }, 1500);

export const emailStore = writable("");