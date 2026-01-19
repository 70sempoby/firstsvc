// app.js
console.log("✅ app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
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

  // ====== 필수 요소 체크 (id 불일치면 여기서 잡힘) ======
  const required = {
    lookupForm: form,
    studentId: studentIdEl,
    studentName: studentNameEl,
    resultEmpty,
    resultBox,
    accountEmail,
    copyEmailBtn,
    resetBtn,
    resetLink,
    message: messageEl,
  };

  const missing = Object.entries(required)
    .filter(([, el]) => !el)
    .map(([k]) => k);

  if (missing.length) {
    console.error("❌ HTML에서 아래 id를 찾지 못했습니다:", missing);
    alert("HTML id가 일치하지 않아 검색이 동작하지 않습니다.\n콘솔(Console)을 확인하세요.");
    return;
  }

  // ====== 유틸 ======
  const normalizeId = (v) => String(v ?? "").trim();
  const normalizeName = (v) =>
    String(v ?? "").trim().replace(/\s+/g, "").toLowerCase();

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
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
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

  function findStudent(id, name) {
    const nid = normalizeId(id);
    const nname = normalizeName(name);

    return STUDENTS.find(
      (s) => normalizeId(s.studentId) === nid && normalizeName(s.studentName) === nname
    );
  }

  // ====== 이벤트 ======
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = studentIdEl.value;
    const name = studentNameEl.value;

    console.log("🔎 submit:", { id, name });

    if (!normalizeId(id) || !normalizeName(name)) {
      showResult(); // 메시지 보이게
      accountEmail.textContent = "-";
      setMessage("학번과 이름을 모두 입력해 주세요.", "err");
      return;
    }

    const student = findStudent(id, name);

    if (!student) {
      showResult(); // 메시지 보이게
      accountEmail.textContent = "-";
      setMessage("일치하는 정보가 없습니다. 학번/이름을 다시 확인해 주세요.", "err");
      return;
    }

    showResult();
    accountEmail.textContent = student.email;
    setMessage("계정(ID)을 확인했습니다. 필요하면 복사 버튼을 누르세요.", "ok");

    resetLink.href =
      "reset.html?studentId=" +
      encodeURIComponent(normalizeId(id)) +
      "&name=" +
      encodeURIComponent(name);
  });

  copyEmailBtn.addEventListener("click", async () => {
    const email = accountEmail.textContent?.trim();
    if (!email || email === "-") return;

    try {
      await copyToClipboard(email);
      setMessage("계정(ID)을 클립보드에 복사했습니다.", "ok");
    } catch {
      setMessage("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.", "err");
    }
  });

  resetBtn.addEventListener("click", () => {
    studentIdEl.value = "";
    studentNameEl.value = "";
    accountEmail.textContent = "-";
    resetLink.href = "#";
    showEmpty();
    setMessage("");
    studentIdEl.focus();
  });

  showEmpty();
  setMessage("");
});
