// App.jsx
import React, { useState } from 'react';
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

  // 최종 결과 MBTI 코드
  const [finalMbti, setFinalMbti] = useState('ENFP');

  // 1. 검사 시작
  const handleStart = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('이름이나 멋진 별명을 입력해 주세요!');
      return;
    }
    setStep('quiz');
    setCurrentIndex(0);
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  };

  // 2. 답변 선택 시 점수 누적 및 다음 단계 이동
  const handleSelectOption = (type) => {
    const updatedScores = {
      ...scores,
      [type]: scores[type] + 1
    };
    setScores(updatedScores);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 모든 문항 완료 -> 분석 로딩 화면으로 전환
      setStep('loading');
      calculateMbti(updatedScores);
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

    // 1.8초 뒤 결과 화면 렌더링
    setTimeout(() => {
      setStep('result');
    }, 1800);
  };

  // 4. 다시 검사하기
  const handleRestart = () => {
    setStep('intro');
    setCurrentIndex(0);
    setUserName('');
  };

  // 5. 결과 인쇄/저장
  const handlePrint = () => {
    window.print();
  };

  const currentQ = questions[currentIndex];
  const resultData = mbtiResults[finalMbti] || mbtiResults.ENFP;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 flex flex-col items-center justify-center font-sans text-gray-800">
      
      {/* ================= STEP 1: 인트로 화면 ================= */}
      {step === 'intro' && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border-4 border-indigo-100 text-center transition-all">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <span className="text-4xl">🧭</span>
          </div>
          <h1 className="text-2xl font-black text-indigo-900 mb-2">
            드림 파인더 (Dream Finder)
          </h1>
          <p className="text-sm text-gray-600 mb-6 font-medium">
            나의 성향(MBTI)을 찾고, 나와 닮은 <br />
            <strong className="text-indigo-600">역사 속 위인 롤모델</strong>과 멋진 미래 직업을 만나요!
          </p>

          <form onSubmit={handleStart} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                너의 이름(또는 별명)을 알려줘!
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="예: 홍길동, 꿈나무"
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none font-semibold text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                학년 선택
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none font-semibold text-gray-800 bg-white"
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
              type="submit"
              className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-indigo-300 transition-all flex items-center justify-center space-x-2"
            >
              <span>탐험 시작하기</span>
              <span>🚀</span>
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-400">
            총 12개 질문 • 소요 시간 약 3분
          </div>
        </div>
      )}

      {/* ================= STEP 2: 질문 진행 화면 ================= */}
      {step === 'quiz' && (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-4 border-indigo-100">
          {/* 상단 진행률 바 */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs font-bold text-indigo-700 mb-2">
              <span>질문 {currentIndex + 1} / {questions.length}</span>
              <span>{progressPercent}% 완료</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 질문 카드 */}
          <div className="bg-indigo-50 rounded-2xl p-6 mb-6 text-center border-2 border-indigo-100 min-h-[120px] flex items-center justify-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* 2가지 선택지 버튼 */}
          <div className="space-y-4">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt.type)}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/60 active:scale-98 transition-all font-semibold text-gray-800 shadow-sm flex items-start space-x-3 group"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {idx === 0 ? 'A' : 'B'}
                </span>
                <span className="leading-relaxed text-sm sm:text-base">
                  {opt.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 3: 분석 로딩 화면 ================= */}
      {step === 'loading' && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border-4 border-indigo-100 text-center animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              📚
            </div>
          </div>
          <h3 className="text-xl font-black text-indigo-950 mb-2">
            {userName} 님의 성향을 분석 중...
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            역사 도서관을 뒤져서 {userName} 님과 꼭 닮은 <br />
            <span className="text-indigo-600 font-bold">역사 속 위인 멘토</span>를 찾고 있어요!
          </p>
        </div>
      )}

      {/* ================= STEP 4: 결과 수료증 리포트 ================= */}
      {step === 'result' && (
        <div className="w-full max-w-xl space-y-6">
          {/* 상장 형태의 결과 카드 */}
          <div id="result-card" className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-8 border-indigo-200 relative overflow-hidden">
            
            {/* 상단 훈장 배지 장식 */}
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-full uppercase tracking-wider mb-2">
                ★ 드림 파인더 진로 탐험 수료증 ★
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                {userName} ({grade})
              </h2>
              <div className="mt-3 inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-2xl shadow-md">
                <span className="text-xl font-black">{finalMbti}</span>
                <span className="text-sm font-bold border-l border-white/40 pl-2">
                  {resultData.title}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600 font-medium px-4">
                "{resultData.tagline}"
              </p>
            </div>

            <hr className="border-dashed border-gray-200 my-6" />

            {/* 추천 진로 및 직업군 */}
            <div className="mb-6">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-3 flex items-center space-x-1">
                <span>🎯</span>
                <span>너의 재능이 빛날 추천 직업군</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {resultData.jobs.map((job, idx) => (
                  <div key={idx} className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 text-center font-bold text-xs sm:text-sm text-indigo-900">
                    ✨ {job}
                  </div>
                ))}
              </div>
            </div>

            {/* 역사 속 국내외 멘토 듀얼 카드 */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center space-x-1">
                <span>👑</span>
                <span>너와 닮은 역사 속 롤모델 멘토</span>
              </h4>

              {/* 1. 한국사 위인 */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    대한민국 멘토
                  </span>
                  <span className="text-xs text-amber-900 font-bold">
                    {resultData.koreanHero.role}
                  </span>
                </div>
                <h5 className="text-base font-black text-gray-900 mb-1">
                  🇰🇷 {resultData.koreanHero.name}
                </h5>
                <p className="text-xs text-gray-600 mb-2">
                  {resultData.koreanHero.desc}
                </p>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 text-xs text-amber-950 font-semibold italic">
                  💬 "{resultData.koreanHero.quote}"
                </div>
              </div>

              {/* 2. 세계사 위인 */}
              <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    세계사 멘토
                  </span>
                  <span className="text-xs text-sky-900 font-bold">
                    {resultData.worldHero.role}
                  </span>
                </div>
                <h5 className="text-base font-black text-gray-900 mb-1">
                  🌍 {resultData.worldHero.name}
                </h5>
                <p className="text-xs text-gray-600 mb-2">
                  {resultData.worldHero.desc}
                </p>
                <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100 text-xs text-sky-950 font-semibold italic">
                  💬 "{resultData.worldHero.quote}"
                </div>
              </div>
            </div>

            {/* 응원 메시지 */}
            <div className="mt-6 text-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">
                {resultData.advice}
              </p>
            </div>
          </div>

          {/* 하단 버튼 액션 그룹 */}
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm"
            >
              <span>결과 카드 인쇄 / PDF 저장</span>
              <span>🖨️</span>
            </button>
            <button
              onClick={handleRestart}
              className="px-6 py-3.5 bg-white hover:bg-gray-100 text-gray-700 font-extrabold rounded-2xl border-2 border-gray-200 transition-all active:scale-95 text-sm"
            >
              다시 하기 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}