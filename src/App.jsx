// App.jsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { questions, mbtiResults } from './mbtiData';

export default function App() {
  // 상태 관리: 단계 ('intro' | 'quiz' | 'loading' | 'result')
  const [step, setStep] = useState('intro');
  const [userName, setUserName] = useState('');
  const [grade, setGrade] = useState('초등 5학년');
  
  // 퀴즈 진행 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0,
  });

  // 선택 히스토리 (이전 질문 돌아가기 지원)
  const [history, setHistory] = useState([]);

  // 최종 결과 MBTI 코드
  const [finalMbti, setFinalMbti] = useState('ENFP');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 1. 검사 시작
  const handleStart = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('이름이나 멋진 별명을 입력해 주세요!');
      return;
    }
    setStep('quiz');
    setCurrentIndex(0);
    setHistory([]);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  };

  // 2. 답변 선택 시 점수 누적 및 다음 단계 이동
  const handleSelectOption = (type) => {
    const updatedScores = {
      ...scores,
      [type]: scores[type] + 1
    };
    setScores(updatedScores);
    setHistory([...history, { index: currentIndex, selectedType: type }]);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 모든 문항 완료 -> 분석 로딩 화면으로 전환
      setStep('loading');
      calculateMbti(updatedScores);
    }
  };

  // 2-1. 이전 문항으로 돌아가기
  const handlePrevious = () => {
    if (currentIndex > 0 && history.length > 0) {
      const lastAnswer = history[history.length - 1];
      const revertedScores = {
        ...scores,
        [lastAnswer.selectedType]: Math.max(0, scores[lastAnswer.selectedType] - 1)
      };
      setScores(revertedScores);
      setHistory(history.slice(0, -1));
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 3. MBTI 지표 계산 알고리즘
  const calculateMbti = (finalScores) => {
    const eOrI = finalScores.E >= finalScores.I ? 'E' : 'I';
    const sOrN = finalScores.S >= finalScores.N ? 'S' : 'N';
    const tOrF = finalScores.T >= finalScores.F ? 'T' : 'F';
    const jOrP = finalScores.J >= finalScores.P ? 'J' : 'P';

    const resultType = `${eOrI}${sOrN}${tOrF}${jOrP}`;
    setFinalMbti(resultType);

    // 1.8초 뒤 결과 화면 렌더링 + 컨페티 효과
    setTimeout(() => {
      setStep('result');
      triggerCelebration();
    }, 1800);
  };

  // 축하 컨페티 효과
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  };

  // 4. 다시 검사하기
  const handleRestart = () => {
    setStep('intro');
    setCurrentIndex(0);
    setHistory([]);
    setUserName('');
  };

  // 5. 결과 인쇄/저장
  const handlePrint = () => {
    window.print();
  };

  // 6. 결과 공유 / 클립보드 복사
  const handleShare = () => {
    const shareText = `[드림 파인더] ${userName}님의 진로 탐색 결과: ${finalMbti} (${resultData.title})! 나와 닮은 역사 위인과 미래 유망 직업을 확인해보세요.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      triggerToast('결과 요약이 클립보드에 복사되었습니다! 친구들에게 공유해보세요.');
    } else {
      triggerToast('공유 준비가 완료되었습니다.');
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const currentQ = questions[currentIndex];
  const resultData = mbtiResults[finalMbti] || mbtiResults.ENFP;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // 성향별 점수 비율 계산 (시각화용)
  const getDimensionStats = () => {
    const totalEI = (scores.E + scores.I) || 1;
    const totalSN = (scores.S + scores.N) || 1;
    const totalTF = (scores.T + scores.F) || 1;
    const totalJP = (scores.J + scores.P) || 1;

    return [
      { left: '외향(E)', right: '내향(I)', leftVal: Math.round((scores.E / totalEI) * 100), rightVal: Math.round((scores.I / totalEI) * 100), dominant: scores.E >= scores.I ? 'E' : 'I' },
      { left: '감각(S)', right: '직관(N)', leftVal: Math.round((scores.S / totalSN) * 100), rightVal: Math.round((scores.N / totalSN) * 100), dominant: scores.S >= scores.N ? 'S' : 'N' },
      { left: '사고(T)', right: '감정(F)', leftVal: Math.round((scores.T / totalTF) * 100), rightVal: Math.round((scores.F / totalTF) * 100), dominant: scores.T >= scores.F ? 'T' : 'F' },
      { left: '판단(J)', right: '인식(P)', leftVal: Math.round((scores.J / totalJP) * 100), rightVal: Math.round((scores.P / totalJP) * 100), dominant: scores.J >= scores.P ? 'J' : 'P' },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 flex flex-col items-center justify-center font-sans text-gray-800 selection:bg-indigo-500 selection:text-white">
      
      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-fade-in border border-slate-700">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= STEP 1: 인트로 화면 ================= */}
      {step === 'intro' && (
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-indigo-100 text-center transition-all animate-fade-in">
          <div className="inline-block p-4 bg-indigo-100/80 rounded-full mb-4 shadow-inner transform hover:rotate-12 transition-transform duration-300">
            <span className="text-5xl" role="img" aria-label="compass">🧭</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-indigo-900 mb-2 tracking-tight">
            드림 파인더 (Dream Finder)
          </h1>
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-4">
            🎓 초·중학생 맞춤형 MBTI 진로 탐색
          </div>
          <p className="text-sm text-gray-600 mb-6 font-medium leading-relaxed">
            나의 성향(MBTI)을 찾고, 나와 닮은 <br />
            <strong className="text-indigo-600 font-extrabold">역사 속 위인 롤모델</strong>과 멋진 미래 직업을 만나요!
          </p>

          <form onSubmit={handleStart} className="space-y-4 text-left">
            <div>
              <label htmlFor="user-name-input" className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>너의 이름(또는 별명)을 알려줘!</span>
                <span className="text-indigo-600 text-[11px]">* 필수</span>
              </label>
              <input
                id="user-name-input"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="예: 홍길동, 꿈나무"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none font-semibold text-gray-800 transition-all placeholder:text-gray-400"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="grade-select" className="block text-xs font-bold text-gray-700 mb-1.5">
                학년 선택
              </label>
              <select
                id="grade-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none font-semibold text-gray-800 bg-white transition-all cursor-pointer"
              >
                <option value="초등 4학년">초등학교 4학년</option>
                <option value="초등 5학년">초등학교 5학년</option>
                <option value="초등 6학년">초등학교 6학년</option>
                <option value="중학교 1학년">중학교 1학년</option>
                <option value="중학교 2학년">중학교 2학년</option>
                <option value="중학교 3학년">중학교 3학년</option>
              </select>
            </div>

            <button
              id="start-button"
              type="submit"
              className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <span>탐험 시작하기</span>
              <span className="group-hover:translate-x-1 transition-transform">🚀</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-indigo-50 flex items-center justify-center space-x-4 text-xs text-gray-400 font-medium">
            <span className="flex items-center space-x-1">
              <span>📋</span>
              <span>총 12문항</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>⏱️</span>
              <span>소요시간 약 3분</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>📜</span>
              <span>수료증 발급</span>
            </span>
          </div>
        </div>
      )}

      {/* ================= STEP 2: 질문 진행 화면 ================= */}
      {step === 'quiz' && (
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-indigo-100 transition-all animate-fade-in">
          {/* 상단 진행률 바 */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs font-bold text-indigo-700 mb-2">
              <span className="flex items-center space-x-1.5">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-[11px]">
                  질문 {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-gray-400 font-normal">
                  ({currentQ.dimension} 탐색)
                </span>
              </span>
              <span className="font-extrabold text-indigo-600">{progressPercent}% 완료</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 질문 카드 */}
          <div className="bg-gradient-to-b from-indigo-50/90 to-purple-50/50 rounded-2xl p-6 mb-6 text-center border-2 border-indigo-100 min-h-[130px] flex flex-col items-center justify-center shadow-sm">
            <span className="text-xs font-extrabold text-indigo-500 tracking-wider mb-1 uppercase">
              Question {currentIndex + 1}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-snug break-keep">
              {currentQ.question}
            </h2>
          </div>

          {/* 2가지 선택지 버튼 */}
          <div className="space-y-3.5">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                id={`option-button-${idx}`}
                onClick={() => handleSelectOption(opt.type)}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-indigo-100/80 hover:border-indigo-500 hover:bg-indigo-50/70 hover:shadow-md active:scale-[0.99] transition-all font-semibold text-gray-800 shadow-sm flex items-start space-x-3.5 group cursor-pointer"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 transition-all shadow-sm">
                  {idx === 0 ? 'A' : 'B'}
                </span>
                <span className="leading-relaxed text-sm sm:text-base pt-0.5 break-keep">
                  {opt.text}
                </span>
              </button>
            ))}
          </div>

          {/* 하단 뒤로가기 버튼 */}
          {currentIndex > 0 && (
            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center space-x-1 hover:text-indigo-600 transition-colors font-bold cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-100"
              >
                <span>← 이전 질문</span>
              </button>
              <span className="text-gray-400">마음을 편안하게 먹고 솔직하게 선택해줘!</span>
            </div>
          )}
        </div>
      )}

      {/* ================= STEP 3: 분석 로딩 화면 ================= */}
      {step === 'loading' && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border-4 border-indigo-100 text-center animate-fade-in">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce-soft">
              📚
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-indigo-950 mb-2">
            {userName} 님의 성향을 분석 중...
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            역사 도서관을 뒤져서 <span className="font-bold text-gray-800">{userName}</span> 님과 꼭 닮은 <br />
            <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">역사 속 위인 멘토</span>를 찾고 있어요!
          </p>
          <div className="mt-6 flex justify-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
            <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
          </div>
        </div>
      )}

      {/* ================= STEP 4: 결과 수료증 리포트 ================= */}
      {step === 'result' && (
        <div className="w-full max-w-2xl space-y-6 animate-fade-in">
          {/* 상장 형태의 결과 카드 */}
          <div id="result-card" className="bg-white rounded-3xl shadow-2xl p-6 sm:p-9 border-8 border-indigo-200 relative overflow-hidden">
            
            {/* 배경 워터마크 장식 */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-pink-100/40 to-amber-100/40 rounded-full blur-2xl pointer-events-none" />

            {/* 상단 훈장 배지 장식 */}
            <div className="text-center mb-6 relative">
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-100 via-indigo-100 to-purple-100 text-indigo-900 font-black text-xs rounded-full uppercase tracking-wider mb-3 shadow-sm border border-indigo-200/50">
                ★ 드림 파인더 진로 탐험 수료증 ★
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {userName} <span className="text-base sm:text-lg font-bold text-gray-500">({grade})</span>
              </h2>
              <div className="mt-3 inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white px-6 py-2.5 rounded-2xl shadow-lg shadow-indigo-200">
                <span className="text-2xl font-black tracking-wider">{finalMbti}</span>
                <span className="text-sm font-bold border-l border-white/40 pl-3">
                  {resultData.title}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600 font-medium px-4 max-w-md mx-auto leading-relaxed">
                "{resultData.tagline}"
              </p>
            </div>

            {/* 성향 밸런스 미니 바 */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <h4 className="text-xs font-black text-slate-700 mb-2 flex items-center justify-between">
                <span>📊 나의 4가지 성향 지표 분석</span>
                <span className="text-[11px] text-slate-400 font-normal">문항 응답 기준</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getDimensionStats().map((stat, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-xs">
                    <div className="text-[11px] font-bold text-slate-500 mb-1">
                      {stat.left.split('(')[0]} vs {stat.right.split('(')[0]}
                    </div>
                    <div className="text-xs font-black text-indigo-700">
                      {stat.dominant === 'E' || stat.dominant === 'S' || stat.dominant === 'T' || stat.dominant === 'J' ? stat.left : stat.right}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-dashed border-gray-200 my-6" />

            {/* 추천 진로 및 직업군 */}
            <div className="mb-6">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <span className="text-base">🎯</span>
                <span>너의 재능이 빛날 추천 직업군</span>
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {resultData.jobs.map((job, idx) => (
                  <div key={idx} className="bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors border border-indigo-200/60 rounded-xl p-3 text-center font-bold text-xs sm:text-sm text-indigo-900 flex items-center justify-center space-x-1 shadow-2xs">
                    <span>✨</span>
                    <span>{job}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 역사 속 국내외 멘토 듀얼 카드 */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="text-base">👑</span>
                <span>너와 닮은 역사 속 롤모델 멘토</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. 한국사 위인 */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        대한민국 멘토
                      </span>
                      <span className="text-[11px] text-amber-900 font-bold truncate max-w-[130px]">
                        {resultData.koreanHero.role}
                      </span>
                    </div>
                    <h5 className="text-base font-black text-gray-900 mb-1 flex items-center space-x-1">
                      <span>🇰🇷</span>
                      <span>{resultData.koreanHero.name}</span>
                    </h5>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {resultData.koreanHero.desc}
                    </p>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 text-xs text-amber-950 font-semibold italic shadow-2xs">
                    💬 "{resultData.koreanHero.quote}"
                  </div>
                </div>

                {/* 2. 세계사 위인 */}
                <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                        세계사 멘토
                      </span>
                      <span className="text-[11px] text-sky-900 font-bold truncate max-w-[130px]">
                        {resultData.worldHero.role}
                      </span>
                    </div>
                    <h5 className="text-base font-black text-gray-900 mb-1 flex items-center space-x-1">
                      <span>🌍</span>
                      <span>{resultData.worldHero.name}</span>
                    </h5>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {resultData.worldHero.desc}
                    </p>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-sky-100 text-xs text-sky-950 font-semibold italic shadow-2xs">
                    💬 "{resultData.worldHero.quote}"
                  </div>
                </div>
              </div>
            </div>

            {/* 응원 메시지 */}
            <div className="mt-6 text-center bg-gradient-to-r from-indigo-50/60 to-purple-50/60 p-3.5 rounded-2xl border border-indigo-100">
              <p className="text-xs sm:text-sm text-indigo-900 font-semibold leading-relaxed">
                🌱 {resultData.advice}
              </p>
            </div>
          </div>

          {/* 하단 버튼 액션 그룹 */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 no-print">
            <button
              id="print-button"
              onClick={handlePrint}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
            >
              <span>결과 카드 인쇄 / PDF 저장</span>
              <span>🖨️</span>
            </button>
            <button
              id="share-button"
              onClick={handleShare}
              className="px-5 py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold rounded-2xl border-2 border-purple-200 transition-all active:scale-95 text-sm cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>공유하기</span>
              <span>🔗</span>
            </button>
            <button
              id="restart-button"
              onClick={handleRestart}
              className="px-6 py-4 bg-white hover:bg-gray-100 text-gray-700 font-extrabold rounded-2xl border-2 border-gray-200 transition-all active:scale-95 text-sm cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>다시 하기</span>
              <span>🔄</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
