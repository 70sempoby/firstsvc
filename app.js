// app.js
console.log("✅ app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Inko 준비 (HTML에서 CDN 스크립트가 app.js보다 먼저 로드되어야 함)
  const inko = new Inko();

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
  const messageEl = document.getElementById("message");

  // ====== 유틸 ======
  const normalizeId = (v) => String(v ?? "").trim();
  const normalizeKor = (v) => String(v ?? "").trim().replace(/\s+/g, "");
  const hasLatin = (v) => /[a-zA-Z]/.test(String(v ?? ""));

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

  // ✅ "자동 변환" 메시지를 잠깐 보여주는 헬퍼
  let msgTimer = null;
  function showAutoConvertedName(convertedName, afterText, afterType = "ok", ms = 2000) {
    if (msgTimer) clearTimeout(msgTimer);

    // 자동 변환 안내는 ok 스타일로 표시(원하면 type 변경 가능)
    setMessage(`자동 변환: ${convertedName}`, "ok");

    msgTimer = setTimeout(() => {
      setMessage(afterText, afterType);
      msgTimer = null;
    }, ms);
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

  // ====== 검색 로직 ======
  // 반환: { student, convertedName, usedConversion }
  function findStudentWithConversion(id, nameInput) {
    const nid = normalizeId(id);
    const raw = String(nameInput ?? "").trim();

    const usedConversion = hasLatin(raw);
    const convertedName = usedConversion ? inko.ko(raw) : raw;

    const nName = normalizeKor(convertedName);

    const student = STUDENTS.find(
      (s) => normalizeId(s.studentId) === nid && normalizeKor(s.studentName) === nName
    );

    return { student, convertedName, usedConversion };
  }

  // ====== 이벤트 ======
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

    const { student, convertedName, usedConversion } = findStudentWithConversion(id, name);

    if (!student) {
      showResult();
      accountEmail.textContent = "-";

      // 영타 입력이었다면 "자동 변환"을 잠깐 보여주고 에러 메시지로 복귀
      if (usedConversion) {
        showAutoConvertedName(
          convertedName,
          "일치하는 정보가 없습니다. 학번/이름을 다시 확인해 주세요.",
          "err",
          2000
        );
      } else {
        setMessage("일치하는 정보가 없습니다. 학번/이름을 다시 확인해 주세요.", "err");
      }
      return;
    }

    showResult();
    accountEmail.textContent = student.email;

    // 성공 시에도 영타 입력이면 자동 변환 안내를 잠깐 보여주고 성공 메시지로 복귀
    if (usedConversion) {
      showAutoConvertedName(
        convertedName,
        "계정(ID)을 확인했습니다. 필요하면 복사 버튼을 누르세요.",
        "ok",
        2000
      );
    } else {
      setMessage("계정(ID)을 확인했습니다. 필요하면 복사 버튼을 누르세요.", "ok");
    }
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
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = null;
    setMessage("");
    studentIdEl.focus();
  });

  showEmpty();
  setMessage("");
});
