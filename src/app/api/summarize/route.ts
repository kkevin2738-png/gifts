import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { text, situation } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "변환할 텍스트가 없습니다." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY 
    });

    const situationText = situation ? `현재 상황은 [${situation}] 입니다.` : "";

    const prompt = `다음은 음성 인식(STT)을 통해 변환된 텍스트입니다. ${situationText}
STT 특성상 발음이 뭉개지거나 잘못 인식된(오탈자) 단어들이 있을 수 있습니다.
문맥과 한국인이 자주 쓰는 단어를 종합적으로 고려하여 우선 내용을 매끄럽게 보정한 후, 아래의 지정된 지정된 형식(HTML)으로 요약해 주세요.

## 작성 형식
HTML 형식으로 반환해 주세요. (마크다운 백틱 제외, 순수 HTML 태그만)
<h3>주요 주제</h3>
<p>...</p>
<h3>단락별 요약</h3>
<ul>
  <li><strong>단락 1 제목:</strong> 내용...</li>
  <li><strong>단락 2 제목:</strong> 내용...</li>
</ul>
<h3>향후 할 일 (액션 아이템)</h3>
<ul><li>...</li></ul>

## 원본 STT 내용 (발언자 및 타임스탬프 포함)
${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const summary = response.text;

    const cleanSummary = summary?.replace(/```html/g, "").replace(/```/g, "").trim();

    return NextResponse.json({ summary: cleanSummary });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "요약 서버 처리 중 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}
