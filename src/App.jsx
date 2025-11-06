import { useEffect, useRef, useState } from "react";
import "./App.css";
import "./App.scss";

// 로컬에 저장할 키
const STORAGE_KEY = "hydration-state";

// 오늘날짜
function getTodayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// 자정까지 남은 ms
function msUntilNextMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0); // 오늘 자정+24h = 내일 00:00
  return next - now;
}

// 초기 상태를 localStorage에서 읽어오는 함수
function loadInitialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const today = getTodayStr();
    if (saved && saved.date === today) {
      return {
        goal: Number(saved.goal) || 0,
        drunk: Number(saved.drunk) || 0,
      };
    }
  } catch {}
  return { goal: 0, drunk: 0 };
}

function App() {
  // 지연초기화
  const initial = loadInitialState();
  // 목표값 저장
  const [goal, setGoal] = useState(() => initial.goal);
  // 마신양 저장
  const [drunk, setDrunk] = useState(() => initial.drunk);
  // 알림 중복방지
  const alertRef = useRef(false);
  // 리셋타이머
  const resetTimerRef = useRef(null);

  // 로컬에 저장
  useEffect(() => {
    const today = getTodayStr();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ goal, drunk, date: today })
    );
  }, [goal, drunk]);

  // 자정 자동 초기화 예약
  useEffect(() => {
    const schedule = () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setDrunk(0);
        setGoal(0);
        alertRef.current = false;
        schedule(); //다음 자정도 예약
      }, msUntilNextMidnight());
    };
    schedule();
    return () => resetTimerRef.current && clearTimeout(resetTimerRef.current);
  }, []);

  // 목표입력버튼 누르면 실행
  const goalinput = () => {
    const input = prompt("오늘의 목표량 (mL 단위)");
    if (input === null) return; // 취소 누른경우
    const trimmed = String(input).trim();
    if (!trimmed) return; // 입력값이 없을경우
    // 입력값이 숫자인지 확인
    const parsed = Number(input);
    if (isNaN(parsed) || parsed <= 0) {
      alert("숫자만 입력해주세요.");
      return;
    }
    setGoal(parsed);
    setDrunk(0);
    alertRef.current = false; // 목표 바꾸면 다시 알림 가능
  };

  // 핸들드링크 (기록버튼 누르면 실행)
  const handleDrink = (value) => {
    if (value === 0) {
      // 리셋
      setDrunk(0);
      alertRef.current = false;
      return;
    }
    // 목표가 0인데 누르면 경고
    if (goal === 0) {
      alert("목표를 먼저 설정해주세요.");
      return;
    }
    // 목표 초과 방지
    setDrunk((prev) => {
      const next = prev + value;
      return next > goal ? goal : next;
    });
  };

  // 진행률 계산
  const percent =
    goal > 0 ? Math.min(100, Math.round((drunk / goal) * 100)) : 0;
  //100% 채우면 알림창
  useEffect(() => {
    if (goal > 0 && percent === 100 && !alertRef.current) {
      alertRef.current = true;
      alert("오늘 목표달성에 성공하였습니다 !");
    }
  }, [percent, goal]);

  // 버튼이름 + 값
  const buttons = [
    { name: "한컵", value: 180 },
    { name: "250mL", value: 250 },
    { name: "500mL", value: 500 },
    { name: "1L", value: 1000 },
    { name: "RESET", value: 0 },
  ];
  return (
    <div className="App">
      <h2>Hydration Routine</h2>
      <div className="main">
        <img src="/images/bottle.png" alt="bottle" />
        {/* 목표 진행률 */}
        <div className="progressState">
          <div className="stick">
            <div className="progress" style={{ height: `${percent}%` }}></div>
          </div>
          <p>{percent}%</p>
        </div>
        {/* 목표설정 */}
        <div className="goal">
          <p>
            오늘의 목표 : <strong>{goal}mL</strong>
          </p>
          <button onClick={goalinput}>목표입력</button>
        </div>
        {/* 기록버튼들 */}
        <div className="buttons">
          {buttons.map((btn, i) => (
            <button key={i} onClick={() => handleDrink(btn.value)}>
              {btn.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
