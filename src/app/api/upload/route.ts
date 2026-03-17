import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import os from "os";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const situation = formData.get("situation") as string;

    if (!file) {
      return NextResponse.json(
        { error: "업로드된 파일이 없습니다." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY 
    });

    // Save the file temporarily with a safe ASCII name
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.tmp`;
    const tempFilePath = join(os.tmpdir(), uniqueFileName);
    
    await writeFile(tempFilePath, buffer);

    try {
      // 1. Upload to Gemini File API (displayName에 한글 등 특수문자 있을 경우 ByteString 오류가 나므로 url encoding 하거나 생략)
      const uploadResult = await ai.files.upload({
        file: tempFilePath,
        config: {
          mimeType: file.type || "audio/mp3",
          displayName: encodeURIComponent(file.name).slice(0, 100), // displayName 인코딩 처리 및 길이 제한
        }
      });

      const situationText = situation ? `현재 상황은 [${situation}] 입니다.` : "";

      const prompt = `다음은 업로드된 오디오 파일 내용입니다. ${situationText}
오디오의 음성을 분석 및 요약해 주세요.

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
<ul><li>...</li></ul>`;

      // 2. Generate Content using the uploaded file
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
               role: "user",
               parts: [
                 {
                   fileData: {
                     fileUri: uploadResult.uri,
                     mimeType: uploadResult.mimeType,
                   }
                 },
                 { text: prompt }
               ]
            }
        ]
      });

      const summary = response.text;
      const cleanSummary = summary?.replace(/```html/g, "").replace(/```/g, "").trim();

      // Background cleanup of file from Gemini server is recommended but usually they get deleted after 48h
      if (uploadResult.name) {
        await ai.files.delete({ name: uploadResult.name });
      }

      return NextResponse.json({ summary: cleanSummary });

    } finally {
      // Cleanup local temp file
      try {
        await unlink(tempFilePath);
      } catch (e) {
        console.error("Temp file cleanup error", e);
      }
    }

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "파일 처리 및 요약 중 오류가 발생했습니다.", details: error.message },
      { status: 500 }
    );
  }
}
