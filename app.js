// app.js
console.log("✅ app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Inko 준비
  const inko = new Inko(); // 전역에 Inko가 존재해야 함(=HTML에서 CDN 로딩 완료)

  const STUDENTS = [
    { studentId: "1101", studentName: "홍길동", email: "1101hong@school.example" },
    { studentId: "1102", studentName: "김하늘", email: "1102sky@school.example" },
    { studentId: "1201", studentName: "이준서", email: "1201lee@school.example" },
  ];

  const form = document.getElementById("lookupForm");
  const studentIdEl = document.getElementById("studentId");
  const studentNameEl = document.getElementById("studentName");

  const resultEmpty = document.getElementById("resultEmpty");
  const resultBox = document.getElementById("resultBox");
  const accountEmail = document.getElementById("accountEmail");
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const resetBtn = document.getElementById("resetBtn");
  const messageEl = document.getElementById("message");

  const normalizeId = (v) => String(v ?? "").trim();
  const normalizeKor = (v) => String(v ?? "").trim().replace(/\s+/g, ""); // 공백 제거

  const hasLatin = (v) => /[a-zA-Z]/.test(String(v ?? ""));

  function showResult() { resultEmpty.hidden = true; resultBox.hidden = false; }
  function showEmpty() { resultEmpty.hidden = false; resultBox.hidden = true; }
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
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  function findStudent(id, nameInput) {
    const nid = normalizeId(id);
    const raw = String(nameInput ?? "").trim();

    // ✅ 영어키보드로 친 한글이면 변환
    const candidateName = hasLatin(raw) ? inko.ko(raw) : raw;

    const nName = normalizeKor(candidateName);

    return STUDENTS.find(
      (s) => normalizeId(s.studentId) === nid && normalizeKor(s.studentName) === nName
    );
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = studentIdEl.value;
    const name = studentNameEl.value;

    if (!normalizeId(id) || !String(name ?? "").trim()) {
      showResult();
      accountEmail.textContent = "-";
      setMessage("학번과 이름을 모두 입력해 주세요.", "err");
      return;
    }

    const student = findStudent(id, name);

    if (!student) {
      showResult();
      accountEmail.textContent = "-";
      setMessage("일치하는 정보가 없습니다. 학번/이름을 다시 확인해 주세요.", "err");
      return;
    }

    showResult();
    accountEmail.textContent = student.email;
    setMessage("계정(ID)을 확인했습니다. 필요하면 복사 버튼을 누르세요.", "ok");
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
    showEmpty();
    setMessage("");
    studentIdEl.focus();
  });

  showEmpty();
  setMessage("");
});
