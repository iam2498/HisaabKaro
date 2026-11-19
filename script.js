/**
 * ============================================================================
 * Hisaab Karo - Clean Mobile-First Khata Ledger Script (Vanilla JS)
 * ============================================================================
 */

// ============================================================================
// 1. CENTRALIZED UI LABELS & MESSAGES (Hinglish / Hindi)
// ============================================================================
const LABELS = {
  appName: "Hisaab Karo",
  appTagline: "Aapki Apni Khata Diary",
  autoSave: "Auto-save",
  autoSaved: "Auto-save",
  sectionTitle: "Mere hisaab",
  pagesCount: (n) => `${n} pages`,
  entriesCount: (n) => `${n} entries`,
  moreAria: "Aur options",
  btnRenameShort: "Naam badlo",
  btnDeleteShort: "Delete",
  btnNewPage: "Naya hisaab",
  btnBackupDownload: "Backup lein",
  btnBackupRestore: "Backup restore",
  btnRecoverOld: "Purana data nikalein",
  emptyHome: "Abhi koi hisaab nahi. Neeche se naya hisaab banayein.",
  
  // Table Columns
  colSr: "Sr. No",
  colDefaultName: "Naam / Detail",
  colDefaultAmount: "Amount",
  
  // Buttons
  btnCreatePage: "Naya hisaab",
  btnBack: "Wapas (Home)",
  btnPrintPdf: "PDF",
  btnRename: "Naam badlo",
  btnDelete: "Delete",
  btnOpen: "Kholein",
  btnUndo: "Wapas lao",
  btnDeleteRowTitle: "Ye line hatayein",
  btnDeleteRowAria: (idx) => `Line ${idx} hatayein`,

  // Ledger Screen Labels
  btnAdd: "Jodein",
  btnEntryAdd: "Jodein",
  btnSaveEdit: "Badlein",
  btnCancelEdit: "Raddh karein",
  phDetail: "Naam ya detail likhein",
  phAmount: "Amount",
  signAriaPlus: "Abhi plus hai. Minus karne ke liye dabayein",
  signAriaMinus: "Abhi minus hai. Plus karne ke liye dabayein",
  errAmount: "Sahi amount likhein",
  errAmountTooBig: "Itna bada amount nahi chalega",
  errRowMissing: "Ye line ab maujood nahi hai. Naye entry ki tarah jodein.",
  emptyList: "Koi entry nahi. Neeche se pehli entry jodein.",
  oldColumnsNote: "Is page me kuch purane columns hain jo naye screen me nahi dikhte. Data safe hai.",
  totalLabel: "Total",
  btnPdf: "PDF",
  
  // Modals & Confirmations
  modalCreateTitle: "Naya hisaab banayein",
  modalRenamePageTitle: "Hisaab ka naam badlein",
  modalConfirmDeleteTitle: "Hisaab delete karein?",
  confirmDeletePageTitle: "Hisaab delete karein?",
  confirmDeletePageMsg: (title) => `Kya aap "${title}" ko delete karna chahte hain? Iska sara data hat jayega.`,
  confirmRestoreTitle: "Backup Restore Karein?",
  confirmRestore: "Pehle ka data safety copy me surakshit rakha jayega. Backup file restore karne par abhi ka hisaab badal jayega. Kya aap aage badhna chahte hain?",
  
  // Notifications & Feedback
  toastSaved: "Save ho gaya",
  toastPageCreated: "Naya hisaab ban gaya",
  toastPageDeletedUndo: "Hisaab delete ho gaya",
  toastRowDeletedUndo: "Line hata di gayi",
  toastRestored: "Wapas aa gaya!",
  toastUndoFailed: "Wapas nahi laya ja saka",
  toastPageGoneElsewhere: "Ye hisaab kisi doosre tab me delete ho gaya hai.",
  toastRowGoneElsewhere: "Ye line kisi doosre tab me delete ho gayi hai.",
  toastBackupDownloaded: "Backup download ho gaya",
  toastBackupDownloadError: "Backup download me samasya aayi.",
  toastRestoreSuccess: "Backup safaltapoorvak restore ho gaya!",
  toastRestoreError: "Galat backup file! Sahi Hisaab Karo backup (.json) file chunein.",
  toastPreRestoreFailed: "Safety backup nahi ban paya, restore raddh kiya gaya.",
  toastStorageWarning: "Browser storage disabled hai, hisaab save nahi ho sakega.",
  toastCorruptDataPreserved: "Purana data corrupt tha, ise alag backup me surakshit rakh diya gaya hai.",
  toastCorruptNotSaved: "Purana data bacha nahi paaye. Naya data save nahi hoga jab tak storage theek na ho.",
  toastRecoverDownloaded: "Purana data download ho gaya",
  
  // Input Validation & Hints
  untitledHisaab: "Bina Naam Ka Hisaab",
  printColDetail: "Detail",
  printColAmount: "Amount",
  printJama: "Jama (+)",
  printGhata: "Ghata (-)",
  printFooter: "Hisaab Karo se banaya gaya",
  printEmptyEntry: "Koi entry nahi",
  defaultNewPageTitle: (date) => `Hisaab - ${date}`
};

// ============================================================================
// 2. CONSTANTS & INITIAL STATE
// ============================================================================
const STORAGE_KEY = "hisaab_karo_data_v1";

// Helper to generate guaranteed collision-free IDs
function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Default starter sample page for first-time visitors
const DEFAULT_INITIAL_DATA = {
  pages: [
    {
      id: "page_sample_1",
      title: "Ghar Ka Kharcha (Udaharan)",
      createdAt: new Date().toISOString(),
      columns: [
        { id: "sr", name: LABELS.colSr, type: "sr" },
        { id: "col_1", name: LABELS.colDefaultName, type: "text" },
        { id: "col_2", name: LABELS.colDefaultAmount, type: "amount" }
      ],
      rows: [
        { id: "row_1", values: { col_1: "Doodh ka hisaab", col_2: 1200 } },
        { id: "row_2", values: { col_1: "Kirana aur ration ka saman", col_2: 3450 } },
        { id: "row_3", values: { col_1: "Bijli ka bill", col_2: 850 } },
        { id: "row_4", values: { col_1: "Sabzi mandi", col_2: 420 } }
      ]
    }
  ],
  activePageId: null // null means we are on Home Screen
};

// Active application state
let appState = {
  pages: [],
  activePageId: null
};

// Pending modal callback state
let pendingModalAction = null;

// Session flag: if corrupt data failed to backup to localStorage, disable saveData() to protect original
let storageDisabledDueToCorrupt = false;

// ============================================================================
// 3. STORAGE & PERSISTENCE HELPERS
// ============================================================================

/**
 * Ask browser for persistent storage
 */
function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((isPersisted) => {
      if (isPersisted) {
        console.log("Hisaab Karo: Persistent storage granted.");
      }
    }).catch((err) => {
      console.warn("Storage persist check error:", err);
    });
  }
}

/**
 * Safe write to localStorage
 */
function safeSetStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`Error saving to localStorage key ${key}:`, e);
    showToast(LABELS.toastStorageWarning, true);
    return false;
  }
}

/**
 * Prune backup keys so we keep only the newest N keys per prefix
 * e.g. prefix = "_corrupt_" or "_prerestore_"
 */
function pruneStorageKeys(prefix, keepCount = 3) {
  try {
    const matchingKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY) && key.includes(prefix)) {
        matchingKeys.push(key);
      }
    }
    if (matchingKeys.length <= keepCount) return;

    // Sort ascending by key string (timestamp order)
    matchingKeys.sort();
    const toDeleteCount = matchingKeys.length - keepCount;
    for (let i = 0; i < toDeleteCount; i++) {
      localStorage.removeItem(matchingKeys[i]);
    }
  } catch (err) {
    console.warn("Error pruning storage keys:", err);
  }
}

/**
 * Safety step: ensure every page has at least one text column and one amount column.
 * Silently adds missing columns.
 */
function ensurePageColumns(page) {
  if (!page) return false;
  if (!Array.isArray(page.columns)) page.columns = [];
  let modified = false;

  let textCol = page.columns.find((c) => c.type === "text");
  if (!textCol) {
    textCol = { id: generateId("col"), name: LABELS.colDefaultName, type: "text" };
    page.columns.push(textCol);
    modified = true;
  }

  let amountCol = page.columns.find((c) => c.type === "amount");
  if (!amountCol) {
    amountCol = { id: generateId("col"), name: LABELS.colDefaultAmount, type: "amount" };
    page.columns.push(amountCol);
    modified = true;
  }

  return modified;
}

/**
 * Leniently normalize and repair application data structure.
 * Returns { data, repaired } or null if data is completely corrupt.
 */
function normalizeAppData(parsed) {
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.pages)) {
    return null;
  }

  let repaired = false;
  const validPages = [];

  for (const rawPage of parsed.pages) {
    if (!rawPage || typeof rawPage !== "object") {
      repaired = true;
      continue;
    }

    const page = { ...rawPage };

    if (typeof page.id !== "string" || !page.id.trim()) {
      page.id = generateId("page");
      repaired = true;
    }

    if (typeof page.title !== "string") {
      page.title = LABELS.untitledHisaab;
      repaired = true;
    }

    if (typeof page.createdAt !== "string" || !page.createdAt) {
      page.createdAt = new Date().toISOString();
      repaired = true;
    }

    if (!Array.isArray(page.columns)) {
      page.columns = [];
      repaired = true;
    }

    // Clean columns
    const validCols = [];
    for (const c of page.columns) {
      if (!c || typeof c !== "object") {
        repaired = true;
        continue;
      }
      let colType = c.type;
      if (colType === "number") {
        colType = "amount";
        repaired = true;
      }
      validCols.push({
        id: typeof c.id === "string" && c.id ? c.id : generateId("col"),
        name: typeof c.name === "string" ? c.name : "",
        type: typeof colType === "string" ? colType : "text"
      });
    }
    page.columns = validCols;

    if (ensurePageColumns(page)) {
      repaired = true;
    }

    if (!Array.isArray(page.rows)) {
      page.rows = [];
      repaired = true;
    }

    // Clean rows
    const validRows = [];
    for (const r of page.rows) {
      if (!r || typeof r !== "object") {
        repaired = true;
        continue;
      }
      const rowId = typeof r.id === "string" && r.id ? r.id : generateId("row");
      if (rowId !== r.id) repaired = true;

      let rowValues = r.values;
      if (!rowValues || typeof rowValues !== "object" || Array.isArray(rowValues)) {
        rowValues = {};
        repaired = true;
      }
      validRows.push({
        id: rowId,
        values: rowValues
      });
    }
    page.rows = validRows;

    validPages.push(page);
  }

  return {
    data: {
      pages: validPages,
      activePageId: typeof parsed.activePageId === "string" ? parsed.activePageId : null
    },
    repaired
  };
}

/**
 * Load data from localStorage safely.
 * If data is corrupted, preserves the raw string under a timestamped key and alerts user.
 */
function loadData() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.error("Error reading localStorage:", e);
    showToast(LABELS.toastStorageWarning, true);
    appState = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
    updateRecoveryLinkUI();
    return;
  }

  if (!raw) {
    // First visit: use default sample
    appState = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
    saveData();
    updateRecoveryLinkUI();
    return;
  }

  let parsed = null;
  let isJsonValid = true;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    isJsonValid = false;
  }

  const norm = isJsonValid ? normalizeAppData(parsed) : null;

  if (!norm) {
    console.warn("Corrupted data found, preserving raw data in backup key.");
    const corruptKey = `${STORAGE_KEY}_corrupt_${Date.now()}`;
    const backupSucceeded = safeSetStorageItem(corruptKey, raw);
    pruneStorageKeys("_corrupt_", 3);

    if (backupSucceeded) {
      appState = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
      saveData();
      showToast(LABELS.toastCorruptDataPreserved, false);
    } else {
      // Backup write failed: DO NOT overwrite main key! Run in memory only.
      storageDisabledDueToCorrupt = true;
      appState = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
      showToast(LABELS.toastCorruptNotSaved, true);
    }
    updateRecoveryLinkUI();
    return;
  }

  // If data had to be repaired, save raw string first
  if (norm.repaired) {
    console.warn("Repaired data anomalies, saving backup copy first.");
    const corruptKey = `${STORAGE_KEY}_corrupt_${Date.now()}`;
    const backupSucceeded = safeSetStorageItem(corruptKey, raw);
    pruneStorageKeys("_corrupt_", 3);
    appState = norm.data;
    if (backupSucceeded) {
      saveData();
    }
  } else {
    appState = norm.data;
  }

  updateRecoveryLinkUI();
}

/**
 * Save data to localStorage
 */
function saveData() {
  if (storageDisabledDueToCorrupt) {
    return;
  }
  const success = safeSetStorageItem(STORAGE_KEY, JSON.stringify(appState));
  if (success) {
    indicateSave();
  }
  updateRecoveryLinkUI();
}

/**
 * Visual flash on the auto-saved badge in the header
 */
let saveTimer = null;
function indicateSave() {
  const badge = document.getElementById("save-indicator");
  if (!badge) return;
  badge.style.opacity = "1";
  const dot = badge.querySelector(".save-dot");
  if (dot) {
    dot.style.transform = "scale(1.25)";
    setTimeout(() => { if (dot) dot.style.transform = "scale(1)"; }, 250);
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    badge.style.opacity = "0.75";
  }, 1000);
}

// Multi-tab synchronization: sync when another tab modifies localStorage
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY && e.newValue) {
    try {
      const parsed = JSON.parse(e.newValue);
      const norm = normalizeAppData(parsed);
      if (norm && norm.data) {
        // Save this tab's own activePageId before replacing appState
        const currentTabActivePageId = appState.activePageId;

        appState = norm.data;
        // Never take activePageId from another tab!
        appState.activePageId = currentTabActivePageId;

        // Check if this tab's active page still exists in the new data
        if (currentTabActivePageId) {
          const pageStillExists = appState.pages.some((p) => p.id === currentTabActivePageId);
          if (!pageStillExists) {
            switchView("home");
            showToast(LABELS.toastPageGoneElsewhere);
            return;
          }
        }

        // Check if the other tab deleted the row being edited here
        if (editingRowId && currentTabActivePageId) {
          const currentPage = appState.pages.find((p) => p.id === currentTabActivePageId);
          const rowStillExists = currentPage && (currentPage.rows || []).some((r) => r.id === editingRowId);
          if (!rowStillExists) {
            resetEntryBox();
            showToast(LABELS.toastRowGoneElsewhere);
          }
        }

        // Check if user is typing in the entry box
        const activeEl = document.activeElement;
        const isUserTyping = activeEl && (activeEl === dom.inputEntryDetail || activeEl === dom.inputEntryAmount);

        // Only re-render if user is not actively typing in entry box, preventing disruption
        if (!isUserTyping) {
          if (appState.activePageId && getCurrentPage()) {
            renderCurrentPage();
          } else {
            renderHomePage();
          }
        }

        updateRecoveryLinkUI();
      }
    } catch (err) {
      console.warn("Storage event parse skipped invalid data:", err);
    }
  }
});

// ============================================================================
// 4. DIGIT NORMALIZATION, STRICT AMOUNT VALIDATION & NUMBER FORMATTING
// ============================================================================

/**
 * Convert Devanagari (०-९) and Gujarati (૦-૯) digits to standard ASCII (0-9)
 */
function normalizeDigits(str) {
  if (!str) return "";
  return String(str)
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966))
    .replace(/[૦-૯]/g, (d) => String(d.charCodeAt(0) - 0x0ae6));
}

/**
 * Round safely to 2 decimal places to avoid floating point anomalies (e.g. 0.1 + 0.2)
 */
function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Strict amount parser:
 * Checks if value is finite, non-zero, within 999999999999, and strictly numeric.
 * Returns { valid: true, amount: round2(num) } or { valid: false, amount: 0 }
 */
function parseStrictAmountValue(val) {
  if (val === null || val === undefined) return { valid: false, amount: 0 };
  if (typeof val === "number") {
    if (!Number.isFinite(val) || isNaN(val)) return { valid: false, amount: 0 };
    const rounded = round2(val);
    if (rounded === 0 || Math.abs(rounded) > 999999999999) return { valid: false, amount: 0 };
    return { valid: true, amount: rounded };
  }
  let str = String(val).trim();
  if (!str) return { valid: false, amount: 0 };
  str = normalizeDigits(str).replace(/[\s,₹]/g, "").trim();
  let sign = 1;
  if (str.startsWith("-")) {
    sign = -1;
    str = str.slice(1).trim();
  } else if (str.startsWith("+")) {
    str = str.slice(1).trim();
  }
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(str)) {
    return { valid: false, amount: 0 };
  }
  const num = parseFloat(str);
  if (!Number.isFinite(num) || isNaN(num)) return { valid: false, amount: 0 };
  const rounded = round2(sign * num);
  if (rounded === 0 || Math.abs(rounded) > 999999999999) return { valid: false, amount: 0 };
  return { valid: true, amount: rounded };
}

/**
 * Safely parse a number from cell input using strict check.
 */
function parseNumber(val) {
  const res = parseStrictAmountValue(val);
  return res.valid ? res.amount : 0;
}

/**
 * Format plain number with Indian separators (en-IN, no ₹ symbol)
 */
function formatPlainNumber(amount, forceDecimals = false) {
  const num = round2(amount || 0);
  const hasDecimals = forceDecimals || (num % 1 !== 0);
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Format ISO date string into friendly readable Indian date
 */
function formatFriendlyDate(isoString) {
  if (!isoString) return "--/--/----";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "--/--/----";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "--/--/----";
  }
}

// ============================================================================
// 5. DOM ELEMENT REFERENCES
// ============================================================================
const dom = {
  // Views
  homeView: document.getElementById("home-view"),
  pageView: document.getElementById("page-view"),
  brandLogo: document.getElementById("brand-logo"),

  // Home elements
  btnCreatePage: document.getElementById("btn-create-page"),
  btnBackupDownload: document.getElementById("btn-backup-download"),
  btnBackupRestoreTrigger: document.getElementById("btn-backup-restore-trigger"),
  backupFileInput: document.getElementById("backup-file-input"),
  pagesList: document.getElementById("pages-list"),
  pagesCountBadge: document.getElementById("pages-count-badge"),
  homeEmptyState: document.getElementById("home-empty-state"),
  recoveryRow: document.getElementById("recovery-row"),
  btnRecoverOld: document.getElementById("btn-recover-old"),

  // Page elements (Ledger List + Entry Box Screen)
  btnBackToHome: document.getElementById("btn-back-to-home"),
  sheetPageTitle: document.getElementById("sheet-page-title"),
  btnPrintPdf: document.getElementById("btn-print-pdf"),
  oldColumnsNote: document.getElementById("old-columns-note"),
  ledgerList: document.getElementById("ledger-list"),
  ledgerTotalValue: document.getElementById("ledger-total-value"),
  entryBoxContainer: document.getElementById("entry-box-container"),
  inputEntryDetail: document.getElementById("input-entry-detail"),
  inputEntryAmount: document.getElementById("input-entry-amount"),
  btnSignToggle: document.getElementById("btn-sign-toggle"),
  entryErrorMsg: document.getElementById("entry-error-msg"),
  btnSubmitEntry: document.getElementById("btn-submit-entry"),
  btnCancelEdit: document.getElementById("btn-cancel-edit"),

  // Modals
  modalBackdrop: document.getElementById("modal-backdrop"),
  modalCreatePage: document.getElementById("modal-create-page"),
  inputNewPageTitle: document.getElementById("input-new-page-title"),
  btnConfirmCreatePage: document.getElementById("btn-confirm-create-page"),

  modalRenamePage: document.getElementById("modal-rename-page"),
  inputRenamePageTitle: document.getElementById("input-rename-page-title"),
  btnConfirmRenamePage: document.getElementById("btn-confirm-rename-page"),

  modalConfirm: document.getElementById("modal-confirm"),
  modalConfirmTitle: document.getElementById("modal-confirm-title"),
  modalConfirmMessage: document.getElementById("modal-confirm-message"),
  btnConfirmAction: document.getElementById("btn-confirm-action"),

  toastContainer: document.getElementById("toast-container"),
  printSheet: document.getElementById("print-sheet")
};

// ============================================================================
// 6. MODAL DIALOG MANAGEMENT
// ============================================================================

/**
 * Open a specific modal dialog
 */
function openModal(modalEl) {
  [
    dom.modalCreatePage,
    dom.modalRenamePage,
    dom.modalConfirm
  ].forEach((el) => {
    if (el) el.style.display = "none";
  });

  dom.modalBackdrop.style.display = "flex";
  modalEl.style.display = "block";

  const firstInput = modalEl.querySelector("input, select, button.btn-modal-primary, button.btn-primary");
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 50);
  }
}

/**
 * Close any open modal dialog
 */
function closeModal() {
  dom.modalBackdrop.style.display = "none";
  pendingModalAction = null;
}

/**
 * Open universal confirmation dialog
 */
function confirmAction(title, message, onConfirm) {
  dom.modalConfirmTitle.textContent = title;
  dom.modalConfirmMessage.textContent = message;
  pendingModalAction = onConfirm;
  openModal(dom.modalConfirm);
}

// Global modal event listeners
dom.modalBackdrop.addEventListener("click", (e) => {
  if (e.target === dom.modalBackdrop || e.target.dataset.close === "true") {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && dom.modalBackdrop.style.display === "flex") {
    closeModal();
  }
});

dom.btnConfirmAction.addEventListener("click", () => {
  if (typeof pendingModalAction === "function") {
    pendingModalAction();
  }
  closeModal();
});

// ============================================================================
// 7. TOAST NOTIFICATIONS & UNDO SYSTEM
// ============================================================================

/**
 * Simple toast notification
 */
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "toast-error" : ""}`;
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 2800);
}

/**
 * Actionable toast notification with an Undo button
 */
function showUndoToast(message, actionLabel, durationMs, onAction) {
  const toast = document.createElement("div");
  toast.className = "toast toast-with-action";

  const textSpan = document.createElement("span");
  textSpan.textContent = message;

  const undoBtn = document.createElement("button");
  undoBtn.type = "button";
  undoBtn.className = "btn-toast-undo";
  undoBtn.textContent = actionLabel;

  let timer = null;

  undoBtn.addEventListener("click", () => {
    clearTimeout(timer);
    if (toast.parentNode) toast.parentNode.removeChild(toast);
    onAction();
  });

  toast.appendChild(textSpan);
  toast.appendChild(undoBtn);
  dom.toastContainer.appendChild(toast);

  timer = setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, durationMs);
}

// ============================================================================
// 8. NAVIGATION, VIEW SWITCHING & SINGLE SOURCE OF TRUTH (getPageLedger)
// ============================================================================

// State for active card menu (only one card menu open at a time)
let openCardMenuId = null;

// Global listener to close open card menu on outside click
document.addEventListener("click", (e) => {
  if (openCardMenuId && !e.target.closest(".page-card")) {
    openCardMenuId = null;
    renderHomePage();
  }
});

// Global listener to close open card menu on Escape key with focus restoration
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && openCardMenuId && (!dom.modalBackdrop || dom.modalBackdrop.style.display !== "flex")) {
    const moreBtnId = `btn-card-menu-${openCardMenuId}`;
    openCardMenuId = null;
    renderHomePage();
    const btn = document.getElementById(moreBtnId);
    if (btn) btn.focus();
  }
});

/**
 * Single source of truth for ledger calculations across Home screen, Page screen, and PDF.
 * Returns: { textCol, amountCol, entries, total, count, hasDecimals }
 */
function getPageLedger(page) {
  if (!page) {
    return {
      textCol: null,
      amountCol: null,
      entries: [],
      total: 0,
      count: 0,
      hasDecimals: false
    };
  }

  ensurePageColumns(page);
  const textCol = (page.columns || []).find((c) => c.type === "text") || null;
  const amountCol = (page.columns || []).find((c) => c.type === "amount") || null;

  const entries = [];
  let totalSum = 0;
  let count = 0;

  (page.rows || []).forEach((row) => {
    if (!row || !row.values) return;
    const detail = textCol && row.values[textCol.id] !== undefined && row.values[textCol.id] !== null
      ? String(row.values[textCol.id]).trim()
      : "";

    const rawAmount = amountCol && row.values[amountCol.id] !== undefined && row.values[amountCol.id] !== null
      ? row.values[amountCol.id]
      : null;

    const parsedRes = parseStrictAmountValue(rawAmount);
    const hasValidAmount = parsedRes.valid;
    const amount = hasValidAmount ? parsedRes.amount : 0;

    // A row is counted and kept if it has a non-empty detail OR a valid amount
    if (detail === "" && !hasValidAmount) {
      return;
    }

    count++;
    if (hasValidAmount) {
      totalSum += amount;
    }

    entries.push({
      row,
      detail,
      hasValidAmount,
      amount
    });
  });

  const total = round2(totalSum);
  const hasDecimals = entries.some((e) => e.hasValidAmount && (round2(e.amount) % 1 !== 0)) || (round2(total) % 1 !== 0);

  return {
    textCol,
    amountCol,
    entries,
    total,
    count,
    hasDecimals
  };
}

/**
 * Shared amount string builder for screen and PDF.
 * - The first line WITH a valid amount has no "+" if positive; "-" if negative.
 * - Later lines get "+" or "-".
 * - All lines get forced 2 decimals if hasDecimals is true.
 */
function buildLedgerAmountString(amount, isFirstValidLine, hasDecimals) {
  const rounded = round2(amount);
  const absStr = formatPlainNumber(Math.abs(rounded), hasDecimals);
  if (isFirstValidLine) {
    return (rounded < 0 ? "-" : "") + absStr;
  }
  if (rounded === 0) {
    return absStr;
  }
  return (rounded < 0 ? "-" : "+") + absStr;
}

/**
 * Switch between Home View and Single Hisaab Page View
 */
function switchView(viewName) {
  if (viewName === "home") {
    appState.activePageId = null;
    openCardMenuId = null;
    resetEntryBox();
    clearPrintSheet();
    saveData();
    dom.pageView.style.display = "none";
    dom.homeView.style.display = "block";
    renderHomePage();
    window.scrollTo({ top: 0, behavior: "instant" });
  } else if (viewName === "page") {
    openCardMenuId = null;
    resetEntryBox();
    dom.homeView.style.display = "none";
    dom.pageView.style.display = "block";
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

dom.btnBackToHome.addEventListener("click", () => switchView("home"));
dom.brandLogo.addEventListener("click", () => switchView("home"));

// ============================================================================
// 9. HOME SCREEN: RENDERING & PAGE ACTIONS
// ============================================================================

/**
 * Render the list of pages on the Home Screen.
 * Uses createElement and textContent exclusively to prevent HTML injection.
 */
function renderHomePage() {
  const pages = appState.pages || [];
  dom.pagesCountBadge.textContent = LABELS.pagesCount(pages.length);
  dom.pagesList.innerHTML = "";

  if (pages.length === 0) {
    dom.homeEmptyState.style.display = "block";
    updateRecoveryLinkUI();
    return;
  } else {
    dom.homeEmptyState.style.display = "none";
  }

  pages.forEach((page) => {
    const card = document.createElement("div");
    card.className = "page-card";
    card.dataset.pageId = page.id;

    // Row 1: Title button (opens hisaab) + 44x44 More button (dots SVG)
    const r1 = document.createElement("div");
    r1.className = "card-row-1";

    const titleBtn = document.createElement("button");
    titleBtn.type = "button";
    titleBtn.className = "card-title-btn";
    titleBtn.textContent = page.title || LABELS.untitledHisaab;
    titleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openPage(page.id);
    });

    const isMenuOpen = openCardMenuId === page.id;
    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "card-more-btn";
    moreBtn.id = `btn-card-menu-${page.id}`;
    moreBtn.setAttribute("aria-label", LABELS.moreAria);
    moreBtn.setAttribute("aria-haspopup", "menu");
    moreBtn.setAttribute("aria-controls", `card-menu-${page.id}`);
    moreBtn.setAttribute("aria-expanded", isMenuOpen ? "true" : "false");
    moreBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle><circle cx="5" cy="12" r="1.5"></circle></svg>';

    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = page.id;
      openCardMenuId = (openCardMenuId === targetId) ? null : targetId;
      renderHomePage();
      const refocused = document.getElementById(`btn-card-menu-${targetId}`);
      if (refocused) refocused.focus();
    });

    r1.appendChild(titleBtn);
    r1.appendChild(moreBtn);

    // Compute ledger total & count using the single source of truth helper
    const { total, count, hasDecimals } = getPageLedger(page);

    // Row 2: Friendly date + entries count on left; monospace total on right (no rupee symbol)
    const r2 = document.createElement("div");
    r2.className = "card-row-2";

    const metaSpan = document.createElement("span");
    metaSpan.className = "card-meta";
    metaSpan.textContent = `${formatFriendlyDate(page.createdAt)} · ${LABELS.entriesCount(count)}`;

    const totalSpan = document.createElement("span");
    totalSpan.className = "card-total";
    const totalAbsStr = formatPlainNumber(Math.abs(total), hasDecimals);
    if (total > 0) {
      totalSpan.className += " is-pos";
      totalSpan.textContent = totalAbsStr;
    } else if (total < 0) {
      totalSpan.className += " is-neg";
      totalSpan.textContent = "-" + totalAbsStr;
    } else {
      totalSpan.textContent = totalAbsStr;
    }

    r2.appendChild(metaSpan);
    r2.appendChild(totalSpan);

    card.appendChild(r1);
    card.appendChild(r2);

    // Inline menu below row 2 if this card's more button was toggled open
    if (isMenuOpen) {
      const menu = document.createElement("div");
      menu.className = "card-menu";
      menu.id = `card-menu-${page.id}`;
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-label", LABELS.moreAria);

      const btnRename = document.createElement("button");
      btnRename.type = "button";
      btnRename.className = "card-menu-btn btn-rename";
      btnRename.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg><span>' + LABELS.btnRenameShort + '</span>';
      btnRename.addEventListener("click", (e) => {
        e.stopPropagation();
        openCardMenuId = null;
        renderHomePage();
        promptRenamePage(page.id);
      });

      const btnDelete = document.createElement("button");
      btnDelete.type = "button";
      btnDelete.className = "card-menu-btn btn-delete";
      btnDelete.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg><span>' + LABELS.btnDeleteShort + '</span>';
      btnDelete.addEventListener("click", (e) => {
        e.stopPropagation();
        openCardMenuId = null;
        renderHomePage();
        promptDeletePage(page.id);
      });

      menu.appendChild(btnRename);
      menu.appendChild(btnDelete);
      card.appendChild(menu);
    }

    // Tapping the card (outside more button and outside menu) opens the page
    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-more-btn") || e.target.closest(".card-menu")) {
        return;
      }
      openPage(page.id);
    });

    dom.pagesList.appendChild(card);
  });

  updateRecoveryLinkUI();
}

/**
 * Open a specific hisaab page
 */
function openPage(pageId) {
  const page = appState.pages.find((p) => p.id === pageId);
  if (!page) return;
  appState.activePageId = pageId;
  saveData();
  switchView("page");
}

/**
 * Prompt to create a new page
 */
dom.btnCreatePage.addEventListener("click", () => {
  dom.inputNewPageTitle.value = "";
  openModal(dom.modalCreatePage);
});

dom.btnConfirmCreatePage.addEventListener("click", () => {
  const title = dom.inputNewPageTitle.value.trim() || LABELS.defaultNewPageTitle(formatFriendlyDate(new Date()));
  const newPage = {
    id: generateId("page"),
    title: title,
    createdAt: new Date().toISOString(),
    columns: [
      { id: "sr", name: LABELS.colSr, type: "sr" },
      { id: generateId("col"), name: LABELS.colDefaultName, type: "text" },
      { id: generateId("col"), name: LABELS.colDefaultAmount, type: "amount" }
    ],
    rows: []
  };

  appState.pages.unshift(newPage);
  appState.activePageId = newPage.id;
  saveData();
  closeModal();
  showToast(LABELS.toastPageCreated);
  switchView("page");
});

dom.inputNewPageTitle.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter") dom.btnConfirmCreatePage.click();
});

/**
 * Prompt to rename a page
 */
let targetPageIdForRename = null;
function promptRenamePage(pageId) {
  const page = appState.pages.find((p) => p.id === pageId);
  if (!page) return;
  targetPageIdForRename = pageId;
  dom.inputRenamePageTitle.value = page.title || "";
  openModal(dom.modalRenamePage);
}

dom.btnConfirmRenamePage.addEventListener("click", () => {
  if (!targetPageIdForRename) return;
  const page = appState.pages.find((p) => p.id === targetPageIdForRename);
  if (page) {
    page.title = dom.inputRenamePageTitle.value.trim() || page.title;
    saveData();
    showToast(LABELS.toastSaved);
    if (appState.activePageId === page.id) {
      dom.sheetPageTitle.textContent = page.title;
    } else {
      renderHomePage();
    }
  }
  closeModal();
});

dom.inputRenamePageTitle.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter") dom.btnConfirmRenamePage.click();
});

/**
 * Prompt to delete a page with confirmation and 6-second undo toast
 */
function promptDeletePage(pageId) {
  const page = appState.pages.find((p) => p.id === pageId);
  if (!page) return;

  confirmAction(
    LABELS.confirmDeletePageTitle,
    LABELS.confirmDeletePageMsg(page.title),
    () => {
      const pageIndex = appState.pages.findIndex((p) => p.id === pageId);
      if (pageIndex === -1) return;

      // Capture local closure data
      const deletedPage = JSON.parse(JSON.stringify(page));
      const originalIndex = pageIndex;

      appState.pages.splice(pageIndex, 1);
      if (appState.activePageId === pageId) {
        appState.activePageId = null;
        resetEntryBox();
      }
      saveData();

      if (appState.activePageId) {
        renderCurrentPage();
      } else {
        renderHomePage();
      }

      // Show Undo Toast for 6 seconds using isolated closure variables
      showUndoToast(LABELS.toastPageDeletedUndo, LABELS.btnUndo, 6000, () => {
        const insertAt = Math.min(originalIndex, appState.pages.length);
        appState.pages.splice(insertAt, 0, deletedPage);
        saveData();
        renderHomePage();
        resetEntryBox();
        showToast(LABELS.toastRestored);
      });
    }
  );
}

dom.sheetPageTitle.addEventListener("click", () => {
  if (appState.activePageId) {
    promptRenamePage(appState.activePageId);
  }
});
dom.sheetPageTitle.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (appState.activePageId) {
      promptRenamePage(appState.activePageId);
    }
  }
});

// ============================================================================
// 10. SINGLE HISAAB PAGE VIEW: LEDGER LIST & STICKY ENTRY BOX
// ============================================================================

/**
 * Get active page object
 */
function getCurrentPage() {
  if (!appState.activePageId) return null;
  return appState.pages.find((p) => p.id === appState.activePageId) || null;
}

/**
 * Check if the page has extra columns from legacy data
 */
function hasExtraColumns(page) {
  if (!page) return false;
  const { textCol, amountCol } = getPageLedger(page);
  return (page.columns || []).some(
    (c) => c.type !== "sr" && (!textCol || c.id !== textCol.id) && (!amountCol || c.id !== amountCol.id)
  );
}

// Current sign state ("+" or "-") and editing row tracking
let currentSign = "+";
let editingRowId = null;

/**
 * Update the sign toggle button UI (+ / -) and accessible aria states
 */
function updateSignToggleUI() {
  if (!dom.btnSignToggle) return;
  const isMinus = currentSign === "-";
  dom.btnSignToggle.textContent = isMinus ? "-" : "+";
  dom.btnSignToggle.className = isMinus ? "btn-sign-toggle is-negative" : "btn-sign-toggle is-positive";
  dom.btnSignToggle.setAttribute("aria-pressed", isMinus ? "true" : "false");
  dom.btnSignToggle.setAttribute("aria-label", isMinus ? LABELS.signAriaMinus : LABELS.signAriaPlus);
}

/**
 * Set sign explicitly ("+" or "-")
 */
function setSign(sign) {
  currentSign = sign === "-" ? "-" : "+";
  updateSignToggleUI();
}

/**
 * Toggle between "+" and "-"
 */
function toggleSign() {
  setSign(currentSign === "+" ? "-" : "+");
}

/**
 * Reset entry box safely: clears inputs, error text, resets editing mode and sign to "+"
 */
function resetEntryBox() {
  if (dom.inputEntryDetail) dom.inputEntryDetail.value = "";
  if (dom.inputEntryAmount) dom.inputEntryAmount.value = "";
  if (dom.entryErrorMsg) dom.entryErrorMsg.textContent = "";
  editingRowId = null;
  if (dom.btnSubmitEntry) dom.btnSubmitEntry.textContent = LABELS.btnAdd;
  if (dom.btnCancelEdit) dom.btnCancelEdit.style.display = "none";
  setSign("+");
  document.querySelectorAll(".ledger-line.is-editing").forEach((el) => {
    el.classList.remove("is-editing");
  });
}

/**
 * Switch entry box between Add mode and Edit mode
 */
function setEditMode(isEditing) {
  if (isEditing) {
    dom.btnSubmitEntry.textContent = LABELS.btnSaveEdit;
    dom.btnCancelEdit.style.display = "inline-flex";
  } else {
    editingRowId = null;
    dom.btnSubmitEntry.textContent = LABELS.btnAdd;
    dom.btnCancelEdit.style.display = "none";
  }
}

/**
 * Start editing a row: load values into entry box and highlight the line
 */
function startEditRow(row) {
  const page = getCurrentPage();
  if (!page) return;
  const { textCol, amountCol } = getPageLedger(page);

  editingRowId = row.id;
  const detail = row.values && textCol && row.values[textCol.id] !== undefined ? String(row.values[textCol.id]) : "";
  const rawAmount = row.values && amountCol && row.values[amountCol.id] !== undefined ? row.values[amountCol.id] : "";
  const parsedRes = parseStrictAmountValue(rawAmount);

  if (parsedRes.valid) {
    setSign(parsedRes.amount < 0 ? "-" : "+");
    dom.inputEntryAmount.value = String(Math.abs(round2(parsedRes.amount)));
  } else {
    setSign("+");
    dom.inputEntryAmount.value = "";
  }

  dom.inputEntryDetail.value = detail;
  dom.entryErrorMsg.textContent = "";

  setEditMode(true);
  renderCurrentPage();
  dom.inputEntryDetail.focus();
}

/**
 * Cancel editing: clear inputs and return to add mode
 */
function cancelEdit() {
  resetEntryBox();
  renderCurrentPage();
  dom.inputEntryDetail.focus();
}

/**
 * Delete a row with 6-second undo toast
 */
function deleteLedgerRow(rowId) {
  const page = getCurrentPage();
  if (!page) return;

  const rowIndex = (page.rows || []).findIndex((r) => r.id === rowId);
  if (rowIndex === -1) return;

  if (editingRowId === rowId) {
    resetEntryBox();
  }

  // Capture local closure data
  const targetPageId = page.id;
  const deletedRow = JSON.parse(JSON.stringify(page.rows[rowIndex]));
  const originalIndex = rowIndex;

  page.rows.splice(rowIndex, 1);
  saveData();
  renderCurrentPage();

  showUndoToast(LABELS.toastRowDeletedUndo, LABELS.btnUndo, 6000, () => {
    const targetPage = appState.pages.find((p) => p.id === targetPageId);
    if (!targetPage) {
      showToast(LABELS.toastUndoFailed, true);
      return;
    }
    const insertAt = Math.min(originalIndex, targetPage.rows.length);
    targetPage.rows.splice(insertAt, 0, deletedRow);
    saveData();
    if (appState.activePageId === targetPage.id) {
      renderCurrentPage();
    } else {
      renderHomePage();
    }
    showToast(LABELS.toastRestored);
  });
}

/**
 * Submit entry: handles strict validation, adding new row, and saving edited row
 */
function submitEntry() {
  const page = getCurrentPage();
  if (!page) return;
  const { textCol, amountCol } = getPageLedger(page);
  if (!textCol || !amountCol) return;

  const rawAmount = (dom.inputEntryAmount.value || "").trim();
  if (!rawAmount) {
    dom.entryErrorMsg.textContent = LABELS.errAmount;
    dom.inputEntryAmount.focus();
    return;
  }

  // 1. Normalize digits, strip commas, spaces and currency symbols
  let str = normalizeDigits(rawAmount).replace(/[\s,₹]/g, "").trim();

  // 2. Allow ONE optional leading "+" or "-" (which sets the sign toggle and is removed)
  if (str.startsWith("-")) {
    setSign("-");
    str = str.slice(1).trim();
  } else if (str.startsWith("+")) {
    setSign("+");
    str = str.slice(1).trim();
  }

  // 3. Strict numeric regex: must be only valid digits with optional single dot
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(str)) {
    dom.entryErrorMsg.textContent = LABELS.errAmount;
    dom.inputEntryAmount.focus();
    return;
  }

  const num = parseFloat(str);
  if (!Number.isFinite(num) || isNaN(num)) {
    dom.entryErrorMsg.textContent = LABELS.errAmount;
    dom.inputEntryAmount.focus();
    return;
  }

  // 4. After rounding with round2, reject if 0 or not finite
  const rounded = round2(num);
  if (rounded === 0 || !Number.isFinite(rounded)) {
    dom.entryErrorMsg.textContent = LABELS.errAmount;
    dom.inputEntryAmount.focus();
    return;
  }

  // 5. Reject values above 999999999999 with errAmountTooBig
  if (rounded > 999999999999) {
    dom.entryErrorMsg.textContent = LABELS.errAmountTooBig;
    dom.inputEntryAmount.focus();
    return;
  }

  dom.entryErrorMsg.textContent = "";
  const finalAmount = currentSign === "-" ? -rounded : rounded;
  const detail = (dom.inputEntryDetail.value || "").trim();

  if (editingRowId) {
    // Edit mode: save in place
    const row = (page.rows || []).find((r) => r.id === editingRowId);
    if (!row) {
      // Row missing (deleted elsewhere)
      // Do NOT clear inputs! Show errRowMissing, switch to add mode, keep typed values, do not save.
      dom.entryErrorMsg.textContent = LABELS.errRowMissing;
      showToast(LABELS.errRowMissing, true);
      editingRowId = null;
      dom.btnSubmitEntry.textContent = LABELS.btnEntryAdd;
      dom.btnCancelEdit.style.display = "none";
      return;
    }

    if (!row.values) row.values = {};
    row.values[textCol.id] = detail;
    row.values[amountCol.id] = finalAmount;

    resetEntryBox();
    saveData();
    renderCurrentPage();
    dom.inputEntryDetail.focus();
  } else {
    // Add mode: append new row
    const newRow = {
      id: generateId("row"),
      values: {}
    };
    newRow.values[textCol.id] = detail;
    newRow.values[amountCol.id] = finalAmount;
    if (!Array.isArray(page.rows)) page.rows = [];
    page.rows.push(newRow);

    resetEntryBox();
    saveData();
    renderCurrentPage();
    dom.inputEntryDetail.focus();

    // Scroll list to the newest line
    if (dom.ledgerList && dom.ledgerList.lastElementChild) {
      dom.ledgerList.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

/**
 * Render the full Ledger Screen for the active page
 */
function renderCurrentPage() {
  const page = getCurrentPage();
  if (!page) {
    switchView("home");
    return;
  }

  // 1. Top Bar Title
  dom.sheetPageTitle.textContent = page.title || LABELS.untitledHisaab;

  // Extra columns notification
  if (hasExtraColumns(page)) {
    dom.oldColumnsNote.textContent = LABELS.oldColumnsNote;
    dom.oldColumnsNote.style.display = "block";
  } else {
    dom.oldColumnsNote.style.display = "none";
  }

  // 2. Single source of truth calculation
  const { entries, total, hasDecimals } = getPageLedger(page);

  // Format amount strings with sign rules:
  // First line WITH a valid amount has no "+" if positive; later lines get "+" or "-"
  let firstValidSeen = false;
  entries.forEach((entry, idx) => {
    entry.idx = idx;
    if (entry.hasValidAmount) {
      const isFirst = !firstValidSeen;
      firstValidSeen = true;
      entry.amountStr = buildLedgerAmountString(entry.amount, isFirst, hasDecimals);
    } else {
      entry.amountStr = "";
    }
  });

  // Calculate fixed width in ch based on max amount string length
  let maxLen = 0;
  entries.forEach((e) => {
    if (e.amountStr && e.amountStr.length > maxLen) maxLen = e.amountStr.length;
  });
  const colWidthCh = Math.max(maxLen, 6);

  // 3. Render Ledger List
  dom.ledgerList.innerHTML = "";

  if (entries.length === 0) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "ledger-empty-msg";
    emptyEl.textContent = LABELS.emptyList;
    dom.ledgerList.appendChild(emptyEl);
  } else {
    entries.forEach((entry) => {
      const lineEl = document.createElement("div");
      lineEl.className = "ledger-line";
      lineEl.dataset.rowId = entry.row.id;
      lineEl.setAttribute("role", "listitem");
      if (editingRowId === entry.row.id) {
        lineEl.classList.add("is-editing");
      }

      // Accessible button encompassing amount and detail to start edit
      const mainBtn = document.createElement("button");
      mainBtn.type = "button";
      mainBtn.setAttribute("role", "button");
      mainBtn.setAttribute("tabindex", "0");
      mainBtn.className = "ledger-line-main";
      const ariaText = entry.hasValidAmount
        ? `${entry.amountStr} ${entry.detail ? `(${entry.detail})` : ""}`
        : `${entry.detail}`;
      mainBtn.setAttribute("aria-label", `${ariaText} - Edit karne ke liye dabayein`);

      const amountSpan = document.createElement("span");
      amountSpan.className = "ledger-amount";
      if (entry.hasValidAmount) {
        const rounded = round2(entry.amount);
        if (rounded > 0) amountSpan.classList.add("is-positive");
        else if (rounded < 0) amountSpan.classList.add("is-negative");
        else amountSpan.classList.add("is-zero");
        amountSpan.style.width = `${colWidthCh}ch`;
        amountSpan.textContent = entry.amountStr;
      } else {
        // Plain line with detail only, empty amount area
        amountSpan.style.width = `${colWidthCh}ch`;
        amountSpan.textContent = "";
      }
      mainBtn.appendChild(amountSpan);

      if (entry.detail) {
        const detailSpan = document.createElement("span");
        detailSpan.className = "ledger-detail";
        detailSpan.textContent = `(${entry.detail})`;
        mainBtn.appendChild(detailSpan);
      }

      mainBtn.addEventListener("click", () => {
        startEditRow(entry.row);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn-line-delete";
      deleteBtn.title = LABELS.btnDeleteRowTitle;
      deleteBtn.setAttribute("aria-label", LABELS.btnDeleteRowAria(entry.idx + 1));
      deleteBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteLedgerRow(entry.row.id);
      });

      lineEl.appendChild(mainBtn);
      lineEl.appendChild(deleteBtn);

      dom.ledgerList.appendChild(lineEl);
    });
  }

  // 4. Update Total Bar (matches Home total & PDF total)
  const totalAbsStr = formatPlainNumber(Math.abs(total), hasDecimals);
  const totalDisplay = total < 0 ? `-${totalAbsStr}` : totalAbsStr;
  dom.ledgerTotalValue.textContent = totalDisplay;
  dom.ledgerTotalValue.className = "total-bar-badge";
  if (total > 0) {
    dom.ledgerTotalValue.classList.add("is-positive");
  } else if (total < 0) {
    dom.ledgerTotalValue.classList.add("is-negative");
  } else {
    dom.ledgerTotalValue.classList.add("is-zero");
  }
}

// Event listeners for entry box
dom.btnSignToggle.addEventListener("click", toggleSign);
dom.btnSubmitEntry.addEventListener("click", submitEntry);
dom.btnCancelEdit.addEventListener("click", cancelEdit);

dom.inputEntryDetail.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter") {
    e.preventDefault();
    dom.inputEntryAmount.focus();
  }
});

dom.inputEntryAmount.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter") {
    e.preventDefault();
    submitEntry();
  }
});

// React ONLY when the first character typed is "-" or "+"
dom.inputEntryAmount.addEventListener("input", () => {
  const val = dom.inputEntryAmount.value;
  if (!val) return;
  if (val.startsWith("-")) {
    setSign("-");
    dom.inputEntryAmount.value = val.slice(1);
  } else if (val.startsWith("+")) {
    setSign("+");
    dom.inputEntryAmount.value = val.slice(1);
  }
});

// Mobile visualViewport resize & scroll handling for sticky entry box
if (window.visualViewport) {
  const vv = window.visualViewport;
  const updateViewportOffset = () => {
    if (!dom.entryBoxContainer) return;
    if (vv.scale <= 1.01) {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      dom.entryBoxContainer.style.bottom = `${offset}px`;
    } else {
      dom.entryBoxContainer.style.bottom = "0px";
    }
  };
  vv.addEventListener("resize", updateViewportOffset);
  vv.addEventListener("scroll", updateViewportOffset);
  window.addEventListener("resize", updateViewportOffset);
}

// Measure the entry box height with ResizeObserver and update CSS variable --entry-h
if (window.ResizeObserver && dom.entryBoxContainer) {
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const h = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height;
      if (h > 0) {
        document.documentElement.style.setProperty("--entry-h", `${Math.ceil(h)}px`);
      }
    }
  });
  ro.observe(dom.entryBoxContainer);
}

// ============================================================================
// 11. PDF DOWNLOAD & PLAIN-PAPER PRINT SHEET BUILDER
// ============================================================================

/**
 * Build the hidden print-only container (#print-sheet) from current page data.
 * Pure text and spacing on plain white A4 paper:
 * - Top: title (16pt bold) + date (12pt en-IN)
 * - Lines: [sign+amount] (detail) with monospace tabular numbers & hanging indent
 * - Single horizontal line above total
 * - Total = X,XXX
 */
function buildPrintSheet() {
  const printSheet = dom.printSheet || document.getElementById("print-sheet");
  if (!printSheet) return;
  printSheet.innerHTML = "";

  const page = getCurrentPage();
  if (!page) return;

  // 1. Single source of truth calculation: only valid amounts are printed
  const { entries } = getPageLedger(page);
  const printEntries = (entries || []).filter((e) => e.hasValidAmount);

  // Subtotals: Jama (+) and Ghata (-)
  let jamaSum = 0;
  let ghataSum = 0;
  printEntries.forEach((e) => {
    if (e.amount > 0) jamaSum += e.amount;
    else if (e.amount < 0) ghataSum += e.amount;
  });
  const jama = round2(jamaSum);
  const ghata = round2(ghataSum);
  const total = round2(jama + ghata);

  // Decimals rule: if any line, Jama, Ghata, or Total has decimals, format with 2 decimals everywhere
  const hasDecimals =
    printEntries.some((e) => round2(e.amount) % 1 !== 0) ||
    round2(total) % 1 !== 0 ||
    round2(jama) % 1 !== 0 ||
    round2(ghata) % 1 !== 0;

  // Build amount string with signs
  printEntries.forEach((entry, idx) => {
    entry.amountStr = buildLedgerAmountString(entry.amount, idx === 0, hasDecimals);
  });

  const jamaStr = formatPlainNumber(jama, hasDecimals);
  const ghataStr = "-" + formatPlainNumber(Math.abs(ghata), hasDecimals);
  const totalAbsStr = formatPlainNumber(Math.abs(total), hasDecimals);
  const totalStr = total < 0 ? `-${totalAbsStr}` : totalAbsStr;

  // Calculate amount column width in ch based on the longest amount string with sign (min 8ch)
  const candidateLengths = printEntries.map((e) => e.amountStr.length);
  if (printEntries.some((e) => e.amount > 0)) candidateLengths.push(jamaStr.length);
  if (printEntries.some((e) => e.amount < 0)) candidateLengths.push(ghataStr.length);
  const colWidthCh = Math.max(8, ...candidateLengths);

  // Receipt main container
  const receiptEl = document.createElement("div");
  receiptEl.className = "print-receipt";

  // --- Header block ---
  const headEl = document.createElement("div");
  headEl.className = "print-head";

  const brandEl = document.createElement("div");
  brandEl.className = "print-brand";
  brandEl.textContent = (LABELS.appName || "HISAAB KARO").toUpperCase();
  headEl.appendChild(brandEl);

  const titleEl = document.createElement("div");
  titleEl.className = "print-title";
  titleEl.textContent = page.title || LABELS.untitledHisaab;
  headEl.appendChild(titleEl);

  const metaEl = document.createElement("div");
  metaEl.className = "print-meta";

  const dateSpan = document.createElement("span");
  dateSpan.textContent = formatFriendlyDate(page.createdAt);

  const countSpan = document.createElement("span");
  countSpan.textContent = LABELS.entriesCount(printEntries.length);

  metaEl.appendChild(dateSpan);
  metaEl.appendChild(countSpan);
  headEl.appendChild(metaEl);

  receiptEl.appendChild(headEl);

  // --- Edge case: No valid entries ---
  if (printEntries.length === 0) {
    const bodyEl = document.createElement("div");
    bodyEl.className = "print-body";

    const emptyEl = document.createElement("div");
    emptyEl.className = "print-empty-line";
    emptyEl.textContent = LABELS.printEmptyEntry;
    bodyEl.appendChild(emptyEl);
    receiptEl.appendChild(bodyEl);

    const footEl = document.createElement("div");
    footEl.className = "print-foot";
    footEl.textContent = LABELS.printFooter;
    receiptEl.appendChild(footEl);

    printSheet.appendChild(receiptEl);

    const cutEl = document.createElement("div");
    cutEl.className = "print-cut";
    printSheet.appendChild(cutEl);
    return;
  }

  // Helper to build a single print line
  function createPrintLineEl(entry, index) {
    const lineEl = document.createElement("div");
    lineEl.className = "print-line";

    const ixSpan = document.createElement("span");
    ixSpan.className = "print-ix";
    ixSpan.textContent = String(index);
    lineEl.appendChild(ixSpan);

    const deSpan = document.createElement("span");
    deSpan.className = "print-de";
    deSpan.textContent = entry.detail || "";
    lineEl.appendChild(deSpan);

    const ldSpan = document.createElement("span");
    ldSpan.className = "print-ld";
    lineEl.appendChild(ldSpan);

    const amSpan = document.createElement("span");
    amSpan.className = "print-am";
    const rounded = round2(entry.amount);
    if (rounded > 0) amSpan.classList.add("is-pos");
    else if (rounded < 0) amSpan.classList.add("is-neg");
    else amSpan.classList.add("is-zero");

    amSpan.style.width = `${colWidthCh}ch`;
    amSpan.textContent = entry.amountStr;
    lineEl.appendChild(amSpan);

    return lineEl;
  }

  // --- Body block (cap row + initial lines) ---
  const bodyEl = document.createElement("div");
  bodyEl.className = "print-body";

  const capEl = document.createElement("div");
  capEl.className = "print-cap";

  const capDetailSpan = document.createElement("span");
  capDetailSpan.textContent = LABELS.printColDetail;

  const capAmountSpan = document.createElement("span");
  capAmountSpan.textContent = LABELS.printColAmount;

  capEl.appendChild(capDetailSpan);
  capEl.appendChild(capAmountSpan);
  bodyEl.appendChild(capEl);

  // Closing wrapper (keeps last 2 lines + dash + subtotals + total + foot together)
  const closingEl = document.createElement("div");
  closingEl.className = "print-closing";

  const closingLinesEl = document.createElement("div");
  closingLinesEl.className = "print-body print-closing-body";

  const splitIndex = Math.max(0, printEntries.length - 2);

  for (let i = 0; i < splitIndex; i++) {
    bodyEl.appendChild(createPrintLineEl(printEntries[i], i + 1));
  }
  for (let i = splitIndex; i < printEntries.length; i++) {
    closingLinesEl.appendChild(createPrintLineEl(printEntries[i], i + 1));
  }

  receiptEl.appendChild(bodyEl);
  closingEl.appendChild(closingLinesEl);

  // Dashed divider
  const dashEl = document.createElement("div");
  dashEl.className = "print-dash";
  closingEl.appendChild(dashEl);

  // Subtotal: Jama (+)
  if (printEntries.some((e) => e.amount > 0)) {
    const jamaSub = document.createElement("div");
    jamaSub.className = "print-sub";

    const jamaLbl = document.createElement("span");
    jamaLbl.textContent = LABELS.printJama;

    const jamaVal = document.createElement("span");
    jamaVal.className = "print-am is-pos";
    jamaVal.style.width = `${colWidthCh}ch`;
    jamaVal.textContent = jamaStr;

    jamaSub.appendChild(jamaLbl);
    jamaSub.appendChild(jamaVal);
    closingEl.appendChild(jamaSub);
  }

  // Subtotal: Ghata (-)
  if (printEntries.some((e) => e.amount < 0)) {
    const ghataSub = document.createElement("div");
    ghataSub.className = "print-sub";

    const ghataLbl = document.createElement("span");
    ghataLbl.textContent = LABELS.printGhata;

    const ghataVal = document.createElement("span");
    ghataVal.className = "print-am is-neg";
    ghataVal.style.width = `${colWidthCh}ch`;
    ghataVal.textContent = ghataStr;

    ghataSub.appendChild(ghataLbl);
    ghataSub.appendChild(ghataVal);
    closingEl.appendChild(ghataSub);
  }

  // Total Box
  const totalEl = document.createElement("div");
  totalEl.className = "print-total";
  if (total > 0) totalEl.classList.add("is-pos");
  else if (total < 0) totalEl.classList.add("is-neg");
  else totalEl.classList.add("is-zero");

  const totalLbl = document.createElement("span");
  totalLbl.className = "print-total-label";
  totalLbl.textContent = "Total";

  const totalVal = document.createElement("span");
  totalVal.className = "print-total-value";
  totalVal.textContent = totalStr;

  totalEl.appendChild(totalLbl);
  totalEl.appendChild(totalVal);
  closingEl.appendChild(totalEl);

  // Footer
  const footEl = document.createElement("div");
  footEl.className = "print-foot";
  footEl.textContent = LABELS.printFooter;
  closingEl.appendChild(footEl);

  receiptEl.appendChild(closingEl);
  printSheet.appendChild(receiptEl);

  // Cut line
  const cutEl = document.createElement("div");
  cutEl.className = "print-cut";
  printSheet.appendChild(cutEl);
}

/**
 * Clear the print sheet container
 */
function clearPrintSheet() {
  const printSheet = dom.printSheet || document.getElementById("print-sheet");
  if (printSheet) {
    printSheet.innerHTML = "";
  }
}

/**
 * Handle PDF download button:
 * - Preserves Gujarati and Devanagari titles in the suggested filename.
 * - Strips only illegal filename characters: /[\/:*?"<>|]/g
 * - Builds #print-sheet right before print.
 * - Restores original document.title using afterprint event with { once: true }.
 * - Does NOT clear #print-sheet on afterprint to protect iOS Safari preview rendering.
 */
dom.btnPrintPdf.addEventListener("click", () => {
  const page = getCurrentPage();
  if (page) {
    const previousTitle = document.title;
    const cleanTitle = (page.title || LABELS.untitledHisaab).replace(/[\\/:*?"<>|]/g, "").trim();
    document.title = `${cleanTitle} - Hisaab Karo`;

    buildPrintSheet();

    window.addEventListener(
      "afterprint",
      () => {
        document.title = previousTitle;
      },
      { once: true }
    );

    window.print();
  }
});

// Wire beforeprint for native browser print (Ctrl+P / Cmd+P)
window.addEventListener("beforeprint", buildPrintSheet);

// ============================================================================
// 12. BACKUP, RESTORE & RECOVERY
// ============================================================================

/**
 * Backup Download: Exports all data into a formatted .json file
 */
dom.btnBackupDownload.addEventListener("click", () => {
  try {
    const dataString = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const filename = `hisaab-karo-backup-${dateStr}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(LABELS.toastBackupDownloaded);
  } catch (err) {
    console.error("Backup download error:", err);
    showToast(LABELS.toastBackupDownloadError, true);
  }
});

dom.btnBackupRestoreTrigger.addEventListener("click", () => {
  dom.backupFileInput.value = "";
  dom.backupFileInput.click();
});

/**
 * Validate and sanitize backup file data.
 * Guards against malicious HTML, duplicate IDs, missing 'sr' columns,
 * and performs the legacy 'number' -> 'amount' migration.
 */
function validateAndSanitizeBackupData(data) {
  if (!data || typeof data !== "object") return null;
  if (!Array.isArray(data.pages)) return null;

  const validTypes = new Set(["sr", "text", "number", "amount", "date"]);
  const seenPageIds = new Set();
  const sanitizedPages = [];

  for (const p of data.pages) {
    if (!p || typeof p !== "object") return null;
    if (typeof p.id !== "string" || !p.id.trim()) return null;
    if (!Array.isArray(p.columns) || !Array.isArray(p.rows)) return null;

    let pageId = p.id;
    if (seenPageIds.has(pageId)) {
      pageId = generateId("page");
    }
    seenPageIds.add(pageId);

    // Trim title and cut at 200 characters
    const title = String(p.title || "").trim().slice(0, 200) || LABELS.untitledHisaab;

    let hasSr = false;
    const sanitizedCols = [];
    const seenColIds = new Set();

    for (const col of p.columns) {
      if (!col || typeof col !== "object") return null;
      if (typeof col.id !== "string" || typeof col.name !== "string" || typeof col.type !== "string") {
        return null;
      }
      if (!validTypes.has(col.type)) {
        return null;
      }

      let colId = col.id;
      // If two columns in a page have the same id, reject the file
      if (seenColIds.has(colId)) {
        return null;
      }
      seenColIds.add(colId);

      // Convert legacy "number" to "amount" so calculations are preserved
      const colType = col.type === "number" ? "amount" : col.type;
      if (colType === "sr") hasSr = true;

      sanitizedCols.push({
        id: colId,
        name: col.name,
        type: colType
      });
    }

    // Ensure 'sr' column exists
    if (!hasSr) {
      sanitizedCols.unshift({
        id: "sr",
        name: LABELS.colSr,
        type: "sr"
      });
    }

    const seenRowIds = new Set();
    const sanitizedRows = [];

    for (const row of p.rows) {
      if (!row || typeof row !== "object") return null;
      if (typeof row.id !== "string" || !row.id.trim()) return null;
      if (!row.values || typeof row.values !== "object" || Array.isArray(row.values)) return null;

      let rowId = row.id;
      if (seenRowIds.has(rowId)) {
        rowId = generateId("row");
      }
      seenRowIds.add(rowId);

      // Row values: only string, number or null; coerce anything else to ""; delete unknown keys
      const validColIds = new Set(sanitizedCols.map((c) => c.id));
      const cleanValues = {};
      for (const [k, v] of Object.entries(row.values)) {
        if (!validColIds.has(k)) continue;
        if (typeof v === "string" || typeof v === "number" || v === null) {
          cleanValues[k] = v;
        } else {
          cleanValues[k] = "";
        }
      }

      sanitizedRows.push({
        id: rowId,
        values: cleanValues
      });
    }

    sanitizedPages.push({
      id: pageId,
      title: title,
      createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
      columns: sanitizedCols,
      rows: sanitizedRows
    });
  }

  return {
    pages: sanitizedPages,
    activePageId: null
  };
}

/**
 * Handle backup restore file input with prerestore safety copy
 */
dom.backupFileInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const content = event.target.result;
      const parsed = JSON.parse(content);
      const sanitized = validateAndSanitizeBackupData(parsed);

      if (!sanitized) {
        showToast(LABELS.toastRestoreError, true);
        return;
      }

      confirmAction(
        LABELS.confirmRestoreTitle,
        LABELS.confirmRestore,
        () => {
          // Save current raw localStorage string under prerestore key
          const currentRaw = localStorage.getItem(STORAGE_KEY) || "";
          const prerestoreKey = `${STORAGE_KEY}_prerestore_${Date.now()}`;
          const backupOk = safeSetStorageItem(prerestoreKey, currentRaw);
          pruneStorageKeys("_prerestore_", 3);

          if (!backupOk) {
            showToast(LABELS.toastPreRestoreFailed, true);
            return;
          }

          appState = sanitized;
          saveData();
          resetEntryBox();
          renderHomePage();
          switchView("home");
          showToast(LABELS.toastRestoreSuccess);
          updateRecoveryLinkUI();
        }
      );
    } catch (err) {
      console.error("Restore parse error:", err);
      showToast(LABELS.toastRestoreError, true);
    }
  };

  reader.readAsText(file);
});

/**
 * Check if any corrupt or prerestore backup keys exist in localStorage.
 * If yes, show the recovery link button on Home screen.
 */
function updateRecoveryLinkUI() {
  const row = document.getElementById("recovery-row");
  if (!row) return;

  let hasBackup = false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(`${STORAGE_KEY}_corrupt_`) || key.startsWith(`${STORAGE_KEY}_prerestore_`))) {
        hasBackup = true;
        break;
      }
    }
  } catch (e) {}

  row.style.display = hasBackup ? "flex" : "none";
}

/**
 * Recovery Link: Downloads the newest raw backup string as a .json file without parsing
 */
if (dom.btnRecoverOld) {
  dom.btnRecoverOld.addEventListener("click", () => {
    try {
      const matchingKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(`${STORAGE_KEY}_corrupt_`) || key.startsWith(`${STORAGE_KEY}_prerestore_`))) {
          matchingKeys.push(key);
        }
      }

      if (matchingKeys.length === 0) return;

      // Newest key has the highest timestamp
      matchingKeys.sort().reverse();
      const newestKey = matchingKeys[0];
      const rawString = localStorage.getItem(newestKey) || "";

      const blob = new Blob([rawString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const filename = `hisaab-karo-purana-data-${dateStr}.json`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(LABELS.toastRecoverDownloaded);
    } catch (err) {
      console.error("Recovery download error:", err);
    }
  });
}

// ============================================================================
// 13. APPLICATION INITIALIZATION
// ============================================================================
function initApp() {
  requestPersistentStorage();
  loadData();

  if (appState.activePageId && getCurrentPage()) {
    switchView("page");
  } else {
    switchView("home");
  }
}

// Initialize once DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
