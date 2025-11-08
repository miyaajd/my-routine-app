import { useState, useEffect, useRef } from "react";
// css
import "./Learning.scss";

// data
import menus from "../../data/menu";

// 로컬에 저장할 키
const STORAGE_KEY = "learning-state";
// 프로세스 100% 기준값 고정
const MAX_UNITS = 600;

// 오늘날짜
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 초기 상태를 localStorage에서 읽어오는 함수
function loadInitialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const today = getTodayStr();
    if (saved && saved.date === today) {
      return {
        goal: saved.goal ? String(saved.goal) : "null",
        worked: Number(saved.worked) || 0,
        // 100% 달성시 뜨는 alert창을 이미 봤다면 상태저장
        alerted: !!saved.alerted, //저장된 alerted 그대로 불러오기
        // 완료한 학습 불러오기
        completed: Array.isArray(saved.completed) ? saved.completed : [],
        buttons: Array.isArray(saved.buttons)
          ? saved.buttons
          : [
              { name: "코딩테스트", value: 200 },
              { name: "정처기", value: 200 },
              { name: "오늘의 학습", value: 200 },
              { name: "RESET", value: 0 },
            ],
      };
    }
  } catch {}
  return {
    goal: "null",
    worked: 0,
    alerted: false,
    completed: [],
    buttons: [
      { name: "코딩테스트", value: 200 },
      { name: "정처기", value: 200 },
      { name: "오늘의 학습", value: 200 },
      { name: "RESET", value: 0 },
    ],
  };
}

const Learning = () => {
  // 지연초기화
  const initial = loadInitialState();
  // 목표값 저장
  const [goal, setGoal] = useState(() => initial.goal);
  // 마신양 저장
  const [worked, setWorked] = useState(() => initial.worked);
  // 알림 중복방지
  const alertRef = useRef(initial.alerted);
  //   완료한 목록
  const [completed, setCompleted] = useState(() => initial.completed);
  // 버튼이름 + 값
  const [buttons, setButtons] = useState(() => initial.buttons);

  // 로컬에 저장
  useEffect(() => {
    const today = getTodayStr();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        goal,
        worked,
        date: today,
        alerted: alertRef.current,
        completed,
        buttons,
      })
    );
  }, [goal, worked, completed, buttons]);

  // 자정 자동 초기화 예약
  useEffect(() => {
    const handleResume = () => {
      const today = getTodayStr();
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      // 저장된 날짜와 오늘이 다르면 리셋
      if (!saved || saved.date !== today) {
        setGoal("null");
        setWorked(0);
        alertRef.current = false;
        setCompleted([]);
        setButtons([
          { name: "코딩테스트", value: 200 },
          { name: "정처기", value: 200 },
          { name: "오늘의 학습", value: 200 },
          { name: "RESET", value: 0 },
        ]);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            goal: "null",
            worked: 0,
            date: today,
            alerted: false,
            completed: [],
            buttons: [
              { name: "코딩테스트", value: 200 },
              { name: "정처기", value: 200 },
              { name: "오늘의 학습", value: 200 },
              { name: "RESET", value: 0 },
            ],
          })
        );
      }
    };
    handleResume();
    const onVisible = () => {
      if (document.visibilityState === "visible") handleResume();
    };
    window.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", handleResume);

    return () => {
      window.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", handleResume);
    };
  }, []);

  // 수정하기버튼 누르면 실행
  const goalinput = () => {
    if (completed.length === 0) {
      alert("수정할 항목이 없어요.");
      return;
    }
    // 수정할 항목리스트
    const list = completed.map((v, idx) => `${idx + 1}.${v}`).join("\n");
    const which = prompt(
      `삭제할 번호를 입력하세요(1~${completed.length})\n\n${list}`
    );
    if (which === null) return;

    const idx = Number(which) - 1;
    if (Number.isNaN(idx) || idx < 0 || idx >= completed.length) {
      alert("번호를 다시 선택해주세요");
      return;
    }

    //   삭제할 항목이름
    const deletedName = completed[idx];

    //   버튼즈 배열에서 해당 이름의 value 찾기 (없으면 0)
    const btn = buttons.find((b) => b.name === deletedName);
    const minusValue = btn ? btn.value : 0;

    // 진행률(누적값)에서 빼기 (음수 방지)
    setWorked((prev) => {
      const next = prev - minusValue;
      return next < 0 ? 0 : next;
    });

    const copy = [...completed];
    copy.splice(idx, 1);
    setCompleted(copy);
    setGoal(copy.length ? copy.join(" / ") : "null");
    alertRef.current = false;
  };

  // 진행률 계산
  const percent = Math.min(100, Math.round((worked / MAX_UNITS) * 100));
  //100% 채우면 알림창
  useEffect(() => {
    if (percent === 100 && !alertRef.current) {
      alertRef.current = true;
      // 알림창 본상태를 alerted 로 저장
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ goal, worked, date: getTodayStr(), alerted: true })
      );
      alert("오늘 목표달성에 성공하였습니다 !");
    }
  }, [percent]);

  // 핸들워크드 (기록버튼 누르면 실행)
  const handelWorked = (name, value, index) => {
    // 오늘의 학습 입력하기
    if (name === "오늘의 학습") {
      alert("오늘의 학습을 설정해주세요");
      return;
    }

    if (value === 0) {
      // 리셋버튼
      setWorked(0);
      alertRef.current = false;
      setCompleted([]);
      setGoal("null");
      return;
    }

    // 완료한 학습에 버튼 이름 한번만 기록 (학습입력은 목록에 반영되지 않는 조건)
    if (name !== "오늘의 학습") {
      setCompleted((prev) => (prev.includes(name) ? prev : [...prev, name]));
      setGoal((prev) =>
        prev && prev !== "null"
          ? [...new Set([...prev.split(" / "), name])].join(" / ")
          : name
      );
    }
    // 목표 초과 방지
    setWorked((prev) => {
      const next = prev + value;
      return next > MAX_UNITS ? MAX_UNITS : next;
    });
  };

  //  버튼 커스텀

  const editButton = () => {
    const idx = 2;
    const oldName = buttons[idx]?.name || "오늘의 학습";

    const input = prompt("오늘의 학습 입력 (최대 8글자)", oldName);
    if (input === null) return;
    const trimmed = String(input).trim();
    if (!trimmed) return;
    if (trimmed.length > 8) {
      alert("8글자를 초과했습니다");
      return;
    }

    // 다른 버튼 이름과 겹치면 리턴
    const nameClash = buttons.some((b, i) => i !== idx && b.name === trimmed);
    if (nameClash) {
      alert("같은 학습이 존재합니다");
      return;
    }

    // 버튼 이름 업데이트
    const next = [...buttons];
    next[idx] = { ...next[idx], name: trimmed };
    setButtons(next);
  };

  return (
    <div className="learning">
      <h2>{menus[2].title}</h2>
      <div className="main">
        <img src="/images/learning.png" alt="learning" />
        {/* 목표 진행률 */}
        <div className="progressState">
          <div className="stick">
            <div className="progress" style={{ width: `${percent}%` }}></div>
          </div>
          <p>{percent}%</p>
        </div>
        {/* 목표설정 */}
        <div className="goal">
          <p>
            완료한 학습 :{" "}
            <strong>{completed.length ? completed.join(" / ") : "null"}</strong>
          </p>
          <button onClick={goalinput}>수정하기</button>
        </div>
        {/* 기록버튼들 */}
        <div className="buttons">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={() => handelWorked(btn.name, btn.value, i)}
              disabled={completed.includes(btn.name)} //완료된 항목이면 비활성화
              style={{ opacity: completed.includes(btn.name) ? 0.5 : 1 }}
            >
              {btn.name}
            </button>
          ))}
          {/* 학습입력 버튼 수정하기 버튼 */}
          <p className="edit" onClick={editButton}>
            ↻ 오늘의 학습
          </p>
        </div>
      </div>
    </div>
  );
};

export default Learning;
