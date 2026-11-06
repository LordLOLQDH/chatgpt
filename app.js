import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.0";

const SUPABASE_URL = "https://eopvkwhcgznvubesaszv.supabase.co";
const SUPABASE_KEY = "sb_publishable_d3hVgDqwTuB63BtfumPwoQ_ngy2ig_c";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (id) => document.getElementById(id);
const authScreen = $("auth-screen");
const appShell = $("app-shell");
const authForm = $("auth-form");
const authMessage = $("auth-message");
const authSubmit = $("auth-submit");
const authSwitch = $("auth-switch");
const authSwitchText = $("auth-switch-text");
const conversationList = $("conversation-list");
const messageList = $("message-list");
const welcomeScreen = $("welcome-screen");
const composer = $("composer");
const messageInput = $("message-input");
const sendButton = $("send-button");
let authMode = "login";
let session = null;
let activeConversationId = null;
let busy = false;
let toastTimer;

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function setAuthMode(mode) {
  authMode = mode;
  authSubmit.innerHTML = mode === "login" ? 'Anmelden <span>→</span>' : 'Konto erstellen <span>→</span>';
  authSwitchText.textContent = mode === "login" ? "Noch kein Konto?" : "Du hast schon ein Konto?";
  authSwitch.textContent = mode === "login" ? "Registrieren" : "Anmelden";
  $("auth-password").autocomplete = mode === "login" ? "current-password" : "new-password";
  authMessage.textContent = "";
}

authSwitch.addEventListener("click", () => setAuthMode(authMode === "login" ? "signup" : "login"));

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("auth-email").value.trim();
  const password = $("auth-password").value;
  authSubmit.disabled = true;
  authMessage.textContent = "Einen Moment …";
  try {
    if (authMode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await enterApp(data.session);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      });
      if (error) throw error;
      if (data.session) {
        await enterApp(data.session);
      } else {
        authMessage.textContent = "Fast fertig: Bestätige deine E-Mail-Adresse über den zugesandten Link und melde dich danach an.";
      }
    }
  } catch (error) {
    authMessage.textContent = friendlyAuthError(error);
  } finally {
    authSubmit.disabled = false;
  }
});

function friendlyAuthError(error) {
  const message = String(error?.message || "");
  if (/Invalid login credentials/i.test(message)) return "E-Mail oder Passwort ist falsch.";
  if (/already registered/i.test(message)) return "Für diese E-Mail gibt es bereits ein Konto. Melde dich an.";
  if (/password/i.test(message)) return "Das Passwort muss mindestens 8 Zeichen lang sein.";
  if (/email.*not confirmed/i.test(message)) return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  return message || "Anmeldung fehlgeschlagen. Bitte versuche es erneut.";
}

async function enterApp(nextSession) {
  if (!nextSession) return;
  session = nextSession;
  authScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  $("account-email").textContent = session.user.email || "Dein Konto";
  $("account-avatar").textContent = (session.user.email || "K").charAt(0).toUpperCase();
  await loadConversations();
  startNewChat();
}

async function leaveApp() {
  await supabase.auth.signOut();
  session = null;
  activeConversationId = null;
  appShell.classList.add("hidden");
  authScreen.classList.remove("hidden");
  messageInput.value = "";
  messageList.replaceChildren();
}
$("sign-out").addEventListener("click", leaveApp);

async function loadConversations() {
  const { data, error } = await supabase
    .from("chatgpt_conversations")
    .select("id,title,updated_at")
    .order("updated_at", { ascending: false })
    .limit(60);
  if (error) {
    toast("Chatverlauf konnte nicht geladen werden.");
    return;
  }
  conversationList.replaceChildren();
  (data || []).forEach((chat) => {
    const button = document.createElement("button");
    button.className = "conversation-item" + (chat.id === activeConversationId ? " active" : "");
    const icon = document.createElement("span");
    icon.className = "chat-symbol";
    icon.textContent = "▤";
    const title = document.createElement("span");
    title.className = "chat-title";
    title.textContent = chat.title || "Neuer Chat";
    button.append(icon, title);
    button.addEventListener("click", () => openConversation(chat.id));
    conversationList.append(button);
  });
}

function startNewChat() {
  activeConversationId = null;
  messageList.replaceChildren();
  welcomeScreen.classList.remove("hidden");
  messageInput.value = "";
  messageInput.focus();
  loadConversations();
  $("sidebar").classList.remove("open");
}

async function openConversation(id) {
  activeConversationId = id;
  const { data, error } = await supabase
    .from("chatgpt_messages")
    .select("role,content,created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  if (error) {
    toast("Dieser Chat konnte nicht geöffnet werden.");
    return;
  }
  messageList.replaceChildren();
  (data || []).forEach(renderMessage);
  welcomeScreen.classList.toggle("hidden", Boolean(data?.length));
  await loadConversations();
  $("sidebar").classList.remove("open");
  scrollToBottom();
}

function renderMessage(message) {
  const row = document.createElement("article");
  row.className = "message-row " + (message.role === "user" ? "user" : "assistant");
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = message.role === "user" ? "Du" : "✳";
  const wrapper = document.createElement("div");
  wrapper.className = "message-content-wrap";
  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = message.role === "user" ? "DU" : "CHATGPT";
  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = message.content;
  wrapper.append(label, content);
  row.append(avatar, wrapper);
  messageList.append(row);
}

function showTyping() {
  const row = document.createElement("article");
  row.className = "message-row assistant";
  row.id = "typing-indicator";
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "✳";
  const content = document.createElement("div");
  content.className = "message-content";
  content.innerHTML = '<div class="message-label">CHATGPT</div><div class="typing-dots"><i></i><i></i><i></i></div>';
  row.append(avatar, content);
  messageList.append(row);
  scrollToBottom();
}
function removeTyping() {
  $("typing-indicator")?.remove();
}
function scrollToBottom() {
  const stage = document.querySelector(".chat-stage");
  stage.scrollTop = stage.scrollHeight;
}

async function ensureConversation(firstMessage) {
  if (activeConversationId) return activeConversationId;
  const title = firstMessage.replace(/\s+/g, " ").slice(0, 58) || "Neuer Chat";
  const { data, error } = await supabase
    .from("chatgpt_conversations")
    .insert({ user_id: session.user.id, title })
    .select("id")
    .single();
  if (error) throw error;
  activeConversationId = data.id;
  await loadConversations();
  return activeConversationId;
}

async function sendMessage(text) {
  const message = String(text || "").trim();
  if (!message || busy || !session) return;
  busy = true;
  sendButton.disabled = true;
  messageInput.disabled = true;
  welcomeScreen.classList.add("hidden");
  try {
    const conversationId = await ensureConversation(message);
    renderMessage({ role: "user", content: message });
    messageInput.value = "";
    messageInput.style.height = "auto";
    showTyping();
    const { data, error } = await supabase.functions.invoke("chatgpt", {
      body: { conversation_id: conversationId, message },
    });
    removeTyping();
    if (error) {
      let detail = error.message || "Die Anfrage ist fehlgeschlagen.";
      try {
        const context = await error.context?.json();
        if (context?.error) detail = context.error;
      } catch {}
      throw new Error(detail);
    }
    if (!data?.reply) throw new Error(data?.error || "Die KI hat nicht geantwortet.");
    renderMessage({ role: "assistant", content: data.reply });
    await loadConversations();
  } catch (error) {
    removeTyping();
    renderMessage({ role: "assistant", content: "Die Anfrage ist fehlgeschlagen: " + (error.message || "Unbekannter Fehler") });
    toast(error.message || "Nachricht konnte nicht gesendet werden.");
  } finally {
    busy = false;
    sendButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
    scrollToBottom();
  }
}

composer.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(messageInput.value);
});
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = Math.min(messageInput.scrollHeight, 180) + "px";
});
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});
$("new-chat").addEventListener("click", startNewChat);
document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt));
});
$("sidebar-open").addEventListener("click", () => $("sidebar").classList.add("open"));
$("sidebar-close").addEventListener("click", () => $("sidebar").classList.remove("open"));

const { data: initial } = await supabase.auth.getSession();
if (initial.session) await enterApp(initial.session);
supabase.auth.onAuthStateChange((event, nextSession) => {
  if (event === "SIGNED_OUT") {
    session = null;
    appShell.classList.add("hidden");
    authScreen.classList.remove("hidden");
  } else if (nextSession && !session) {
    enterApp(nextSession);
  }
});
