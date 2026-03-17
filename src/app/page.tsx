"use client";

import { useState, useMemo } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

// 색상 팔레트 (점유율 그래프용)
const COLORS = [
  "#007aff", "#34c759", "#ff9500", "#ff3b30", "#af52de", "#5856d6", "#ff2d55"
];

export default function Home() {
  const {
    isListening,
    transitText,
    finalText,
    currentSpeaker,
    setCurrentSpeaker,
    startListening,
    stopListening,
    clearText,
  } = useSpeechRecognition();

  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");
  const [situation, setSituation] = useState("회의");
  
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // 다중 참석자 동적 관리
  const [participants, setParticipants] = useState<string[]>(["참석자 A", "참석자 B"]);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleRecordToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      if (summary) setSummary(null);
      if (errorText) setErrorText(null);
    }
  };

  const handleAddParticipant = () => {
    const nextChar = String.fromCharCode(65 + participants.length); // A, B, C...
    setParticipants([...participants, `참석자 ${nextChar}`]);
  };

  const handleSummarizeRecord = async () => {
    if (!finalText.trim()) return;
    setIsSummarizing(true);
    setErrorText(null);
    setSummary(null);

    if (isListening) stopListening();

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalText, situation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "요약 실패");
      setSummary(data.summary);
    } catch (err: any) {
      setErrorText(err.message || "오류가 발생했습니다.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSummarizeUpload = async () => {
    if (!selectedFile) return;
    setIsSummarizing(true);
    setErrorText(null);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("situation", situation);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData, 
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "업로드 및 요약 실패");
      setSummary(data.summary);
    } catch (err: any) {
      setErrorText(err.message || "오류가 발생했습니다.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleClear = () => {
    clearText();
    setSelectedFile(null);
    setSummary(null);
    setErrorText(null);
  };

  const copyToClipboard = async () => {
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = summary || "";
      await navigator.clipboard.writeText(tempDiv.innerText);
      alert("회의록이 클립보드에 복사되었습니다!");
    } catch (err) {
      alert("복사에 실패했습니다.");
    }
  };

  // 대화 점유율 계산 (실시간 녹음 시만 적용)
  const shareStats = useMemo(() => {
    if (activeTab !== "record" || !finalText) return null;

    // [09:00:00 AM] 참석자 A: 텍스트 형식 파싱
    const lines = finalText.split("\n").filter(l => l.trim() !== "");
    const stats: Record<string, number> = {};
    let totalLength = 0;

    participants.forEach(p => { stats[p] = 0; });

    lines.forEach(line => {
      // 정규식으로 발언자 추출 (예: "[10:20:30 AM] 참석자 A: 안녕")
      const match = line.match(/^\[.*?\]\s(.*?):\s(.*)$/);
      if (match && match.length === 3) {
        const speaker = match[1];
        const content = match[2];
        const textLength = content.replace(/\s/g, "").length; // 공백 제외 글자수
        
        if (stats[speaker] !== undefined) {
          stats[speaker] += textLength;
          totalLength += textLength;
        } else {
          // 혹시 모를 새 화자 감지
          stats[speaker] = textLength;
          totalLength += textLength;
        }
      }
    });

    if (totalLength === 0) return null;

    // 퍼센티지 매핑
    return Object.entries(stats)
      .filter(([_, len]) => len > 0)
      .map(([name, len], idx) => ({
        name,
        percentage: ((len / totalLength) * 100).toFixed(1),
        color: COLORS[idx % COLORS.length]
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  }, [finalText, activeTab, participants]);


  return (
    <main className="container">
      <div className="header">
        <h1 className="title">Smart Minutes</h1>
        <p className="subtitle">AI가 음성을 분석하여 똑똑하게 요약합니다.</p>
      </div>

      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => { setActiveTab('record'); setSummary(null); setErrorText(null); }}
        >
          실시간 녹음
        </div>
        <div 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => { setActiveTab('upload'); setSummary(null); setErrorText(null); if(isListening) stopListening(); }}
        >
          오디오 파일 업로드
        </div>
      </div>

      <div className="card">
        {/* 공통 상황 설정 */}
        <div className="setup-row">
          <label className="setup-label">상황 설정</label>
          <select 
            className="select-input" 
            value={situation} 
            onChange={(e) => setSituation(e.target.value)}
          >
            <option value="회의">회의</option>
            <option value="강의">강의/수업</option>
            <option value="인터뷰">인터뷰</option>
            <option value="일상 대화">일상 대화</option>
          </select>
        </div>

        {activeTab === 'record' && (
          <>
            <div className="speaker-toggle">
              {participants.map((p) => (
                <button 
                  key={p}
                  className={`speaker-btn ${currentSpeaker === p ? 'active' : ''}`}
                  onClick={() => setCurrentSpeaker(p)}
                >
                  {p}
                </button>
              ))}
              <button className="speaker-add-btn" onClick={handleAddParticipant}>
                + 추가
              </button>
            </div>

            <button
              onClick={handleRecordToggle}
              className={`record-btn ${isListening ? "recording" : ""}`}
            >
              <svg className="record-icon" viewBox="0 0 24 24" fill={isListening ? "none" :"currentColor"} stroke="currentColor" strokeWidth="2">
                {isListening ? (
                  <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v10m0 0a4 4 0 01-4 4H8a4 4 0 01-4-4V5a4 4 0 014-4h0a4 4 0 014 4v6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2m7 11v-4" />
                  </>
                )}
              </svg>
            </button>

            <div className="transcript-area">
              {finalText || transitText ? (
                <>
                  {finalText}
                  <span className="transit-text">{transitText}</span>
                </>
              ) : (
                <span style={{ color: "var(--border-color)" }}>마이크 버튼을 눌러 녹음을 시작하세요.</span>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={handleSummarizeRecord}
              disabled={!finalText.trim() || isListening || isSummarizing}
            >
              {isSummarizing ? <span className="loading-spinner"></span> : "AI 요약하기"}
            </button>
          </>
        )}

        {activeTab === 'upload' && (
          <>
            <div className="upload-container">
              <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <input 
                type="file" 
                accept="audio/*" 
                onChange={handleFileChange} 
                className="file-input"
                style={{ width: "100%" }}
              />
              {selectedFile && <div className="file-name">{selectedFile.name}</div>}
            </div>

            <button
              className="btn-primary"
              onClick={handleSummarizeUpload}
              disabled={!selectedFile || isSummarizing}
            >
              {isSummarizing ? <span className="loading-spinner"></span> : "업로드 & 요약"}
            </button>
          </>
        )}

        {errorText && (
          <div style={{ color: "var(--error)", marginTop: "16px", fontSize: "14px", textAlign: "center" }}>
            {errorText}
          </div>
        )}

        {((finalText && activeTab === 'record') || (selectedFile && activeTab === 'upload')) && (
          <div className="actions">
            <button className="btn-secondary" onClick={handleClear}>초기화</button>
          </div>
        )}
      </div>

      {summary && (
        <div className="card summary-card">
          <div className="summary-header">
            <h2 className="title" style={{ fontSize: "20px", marginBottom: 0 }}>회의록 결과</h2>
            <button className="btn-secondary" style={{ flex: 'none', padding: '8px 16px' }} onClick={copyToClipboard}>
              복사하기
            </button>
          </div>

          {/* 대화 점유율 시각화 */}
          {shareStats && shareStats.length > 0 && (
            <div className="share-insights">
              <div className="share-title">대화 점유율 (글자 수 기준)</div>
              <div className="share-bar-container">
                {shareStats.map(stat => (
                  <div 
                    key={stat.name} 
                    className="share-bar-segment" 
                    style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                    title={`${stat.name}: ${stat.percentage}%`}
                  />
                ))}
              </div>
              <div className="share-legend">
                {shareStats.map(stat => (
                  <div key={stat.name} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: stat.color }} />
                    <span>{stat.name} ({stat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="summary-content"
            dangerouslySetInnerHTML={{ __html: summary }}
          />
        </div>
      )}
    </main>
  );
}
