// app.js
document.addEventListener("DOMContentLoaded", () => {
  // ====== (중요) 예시 데이터 ======
  // 실제 운영에서는 여기에 "실제 계정 데이터"를 그대로 넣지 마세요.
  // 지금은 동작 확인용 샘플입니다.
  // 운영은 서버에서 권한 검증 후 "이메일만" 내려주는 구조를 권장합니다.
  const STUDENTS = [
    { studentId: "1101", studentName: "홍길동", email: "1101hong@school.example" },
    { studentId: "1102", studentName: "김하늘", email: "1102sky@school.example" },
    { studentId: "1201", studentName: "이준서", email: "1201lee@school.example" },
  ];

  // ====== 엘리먼트 ======
  const form = document.getElementById("lookupForm");
  const studentIdEl = document.getElementById("studentId");
  const studentNameEl = document.getElementById("studentName");

  const resultEmpty = document.getElementById("resultEmpty");
  const resultBox = document.getElementById("resultBox");
  const accountEmail = document.getElementById("accountEmail");
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const resetBtn = document.getElementById("resetBtn");
  const resetLink = document.getElementById("resetLink");
  const messageEl = document.getElementById("message");

  // ====== 유틸 ======
  const normalizeId = (v) => String(v ?? "").trim();
  const normalizeName = (v) =>
    String(v ?? "")
      .trim()
      .replace(/\s+/g, "") // 이름 사이 공백 제거
      .toLowerCase();

  function showResult() {
    resultEmpty.hidden = true;
    resultBox.hidden = false;
  }

  function showEmpty() {
    resultEmpty.hidden = false;
    resultBox.hidden = true;
  }

  function setMessage(text = "", type = "") {
    messageEl.textContent = text;
    messageEl.classList.remove("ok", "err");
    if (type === "ok") messageEl.classList.add("ok");
    if (type === "err") messageEl.classList.add("err");
  }

  async function copyToClipboard(text) {
    // 최신 브라우저
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  // ====== 검색 로직 ======
  function findStudent(id, name) {
    const nid = normalizeId(id);
    const nname = normalizeName(name);
