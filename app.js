// app.js
console.log("✅ app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  // ====== Inko 로딩 체크 ======
  const inko = (typeof window.Inko !== "undefined") ? new window.Inko() : null;

  // ====== 예시 데이터 ======
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

  function showResult() { resultEmpty.hidden = true; resultBox.hidden = false; }
  function showEmpty() { resultEmpty.hidden = false; resultBox.hidden = true; }

  function setMessage(text = "", type = "") {
    messageEl.textContent = text;
    messageEl.classList.remove("ok", "err");
    if (type === "ok") messageEl.classList.add("ok");
    if (type === "err") messageEl.classList.add("err");
  }

  // ✅ 자동 변환 메시지 잠깐 표시
  let msgTimer = null;
  function showAutoConvertedName(convertedName, afterText, afterType = "ok", ms = 2000) {
    if (msgTimer) clearTimeout(msgTimer);
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

  // ====== 핵심: 원문 + (가능하면) 변환값 둘 다로 매칭 ======
  // 반환: { student, usedConversion, convertedName }
  function findStudent(id, nameInput) {
    const nid = normalizeId(id);
    const raw = String(nameInput ?? "").trim();

    // 후보 이름 목록(원문은 항상 포함)
    const candidates = [raw];

    let usedConversion = false;
    let convertedName = raw;

    // 영문이 포함되어 있고 inko가 있으면 변환 후보 추가
    if (inko && hasLatin(raw)) {
      convertedName = inko.ko(raw);
      candidates.push(convertedName);
      usedConversion = true;

      // 디버그 로그
      console.log("🔁 inko convert:", raw, "=>", convertedName);
    }

    const normCandidates = candidates.map(normalizeKor);

    const student = STUDENTS.find((s) => {
      if (normalizeId(s.studentId) !== nid) return false;
      const sn = normalizeKor(s.studentName);
      return normCandidates.includes(sn);
    });

    return { student, usedConversion, convertedName };
  }

  // ====== 초기 상태에서 Inko 로딩 여부를 사용자도 알 수 있게 ======
  // (학교망에서 CDN 차단이면 여기 메시지가 뜹니다)
  if (!inko) {
    // 결과 박스는 숨긴 상태라도, 검색 후 메시지에 경고가 뜨도록 준비
    console.warn("⚠️ Inko 로딩 실패: CDN 차단/오프라인/캐시 문제 가능");
  }

  // ====== 이벤트 ======
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 항상 결과 영역을 보이게(상태 변화가 확실히 보이도록)
    showResult();
    accountEmail.textContent = "-";

    const id = studentIdEl.value;
    const name = studentNameEl.value;

    if (!normalizeId(id) || !String(name ?? "").trim()) {
      setMessage("학번과 이름을 모두 입력해 주세요.", "err");
      return;
    }

    const { student, usedConversion, convertedName } = findStudent(id, name);

    // inko가 필요한데 로딩 실패한 상황이면 안내
    if (!inko && hasLatin(name)) {
      setMessage("⚠️ 영타 자동 변환(inko) 로딩에 실패했습니다. (학교망/CDN 차단 가능) 한글로 입력해 주세요.", "err");
      return;
    }

    if (!student) {
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

    accountEmail.textContent = student.email;

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
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = null;
    showEmpty();
    setMessage("");
    studentIdEl.focus();
  });

  showEmpty();
  setMessage("");
});
