import { useState, useEffect, useRef } from "react";
// css
import "./Workout.scss";

// data
import menus from "../../data/menu";

// 로컬에 저장할 키
const STORAGE_KEY = "workout-state";
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
        goal: saved.goal ? String(saved.goal) : "입력하세요",
        worked: Number(saved.worked) || 0,
        // 100% 달성시 뜨는 alert창을 이미 봤다면 상태저장
        alerted: !!saved.alerted, //저장된 alerted 그대로 불러오기
      };
    }
  } catch {}
  return { goal: "입력하세요", worked: 0, alerted: false };
}

function Workout() {
  // 지연초기화
  const initial = loadInitialState();
  // 목표값 저장
  const [goal, setGoal] = useState(() => initial.goal);
  // 마신양 저장
  const [worked, setWorked] = useState(() => initial.worked);
  // 알림 중복방지
  const alertRef = useRef(initial.alerted);

  // 로컬에 저장
  useEffect(() => {
    const today = getTodayStr();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ goal, worked, date: today, alerted: alertRef.current })
    );
  }, [goal, worked]);

  // 자정 자동 초기화 예약
  useEffect(() => {
    const handleResume = () => {
      const today = getTodayStr();
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      // 저장된 날짜와 오늘이 다르면 리셋
      if (!saved || saved.date !== today) {
        setGoal("입력하세요");
        setWorked(0);
        alertRef.current = false;

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            goal: "입력하세요",
            worked: 0,
            date: today,
            alerted: false,
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

  // 운동입력버튼 누르면 실행
  const goalinput = () => {
    const input = prompt("오늘의 운동");
    if (input === null) return; // 취소 누른경우
    const trimmed = String(input).trim();
    if (!trimmed) return; // 입력값이 없을경우
    // 입력값이 문자인지 확인
    const parsed = String(input);
    setGoal(parsed);
    alertRef.current = false; // 목표 바꾸면 다시 알림 가능
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

  // 핸들드링크 (기록버튼 누르면 실행)
  const handelWorked = (value) => {
    // 오늘의 운동 입력하지 않고 오늘의 운동 버튼을 눌렀을 경우
    if (value === 300 && goal === "입력하세요") {
      alert("오늘의 운동을 입력해주세요");
      return;
    }
    if (value === 0) {
      // 리셋
      setWorked(0);
      alertRef.current = false;
      return;
    }
    // 목표 초과 방지
    setWorked((prev) => {
      const next = prev + value;
      return next > MAX_UNITS ? MAX_UNITS : next;
    });
  };

  // 버튼이름 + 값
  const buttons = [
    { name: "스트레칭", value: 100 },
    { name: "10분이상 걷기", value: 200 },
    { name: "오늘의 운동", value: 300 },
    { name: "RESET", value: 0 },
  ];

  return (
    <div className="workout">
      <h2>{menus[1].title}</h2>
      <div className="main">
        <img src="/images/workout.png" alt="workout" />
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
            오늘의 운동 : <strong>{goal}</strong>
          </p>
          <button onClick={goalinput}>운동입력</button>
        </div>
        {/* 기록버튼들 */}
        <div className="buttons">
          {buttons.map((btn, i) => (
            <button key={i} onClick={() => handelWorked(btn.value)}>
              {btn.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Workout;
