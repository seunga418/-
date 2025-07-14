import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export interface ExcuseGenerationRequest {
  category: string;
  tone: string;
  userInput?: string;
  subject?: string;
  timeframe?: string;
}

export interface ExcuseGenerationResponse {
  excuse: string;
  category: string;
  tone: string;
}

const categoryPrompts = {
  health: "몸이 아픈 상황 (감기, 몸살, 복통, 두통 등)",
  family: "가족 관련 문제 (가족 병원 동행, 집안 경조사, 가족 응급상황 등)",
  transport: "교통 관련 문제 (지하철 지연, 교통사고, 차량 고장 등)",
  personal: "개인적인 사정 (중요한 약속, 개인 업무, 갑작스런 일정 등)"
};

const toneInstructions = {
  light: "가벼우면서도 믿을 만한 핑계로, 너무 심각하지 않게",
  moderate: "적당히 그럴듯하고 자연스러운 사유로",
  serious: "진지하고 중요한 사안처럼 들리도록"
};

// Fallback excuses that work without API
const fallbackExcuses = {
  health: "안녕하세요 교수님, 어제 저녁부터 갑자기 몸살기운이 있어서 컨디션이 좋지 않습니다. 오늘 수업 참석이 어려워 결석 처리 부탁드리겠습니다.",
  family: "안녕하세요 교수님, 갑작스럽게 가족 일로 외출해야 하는 상황이 생겨서 오늘 수업에 참석하기 어렵습니다. 결석 처리 부탁드리겠습니다.",
  transport: "안녕하세요 교수님, 지하철 운행 지연으로 인해 수업 시간에 늦을 것 같습니다. 결석 처리 부탁드리겠습니다.",
  personal: "안녕하세요 교수님, 개인적으로 급하게 처리해야 할 일이 생겨서 오늘 수업 참석이 어렵습니다. 결석 처리 부탁드리겠습니다."
};

export async function generateExcuse(request: ExcuseGenerationRequest): Promise<ExcuseGenerationResponse> {
  let selectedCategory = request.category;
  
  // Handle random category selection
  if (request.category === 'random') {
    const categories = ['health', 'family', 'transport', 'personal'];
    selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  }

  // Check if we have a valid API key
  const hasValidApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "default_key";
  
  if (!hasValidApiKey) {
    // Return fallback excuse immediately if no valid API key
    return {
      excuse: fallbackExcuses[selectedCategory as keyof typeof fallbackExcuses] || fallbackExcuses.health,
      category: selectedCategory,
      tone: request.tone
    };
  }

  try {
    const categoryDescription = categoryPrompts[selectedCategory as keyof typeof categoryPrompts];
    const toneInstruction = toneInstructions[request.tone as keyof typeof toneInstructions];

    let prompt = `한국 학생이 수업을 빠질 때 사용할 수 있는 자연스럽고 믿을 만한 핑계를 생성해주세요.

상황 유형: ${categoryDescription}
톤: ${toneInstruction}
${request.subject ? `과목/수업: ${request.subject}` : ''}
${request.timeframe ? `시간: ${request.timeframe}` : ''}
${request.userInput ? `추가 상황 설명: ${request.userInput}` : ''}

요구사항:
1. 교수님이나 선생님께 보내는 정중한 메시지 형태로 작성
2. 한국어로 자연스럽게 작성
3. 너무 과장되지 않고 현실적으로 들리도록
4. "안녕하세요 교수님" 또는 "안녕하세요 선생님"으로 시작
5. 구체적인 상황 설명과 정중한 양해 구하기 포함
6. 100자 이상 200자 이하로 작성

JSON 형태로 응답해주세요:
{
  "excuse": "생성된 핑계 문장",
  "category": "${selectedCategory}",
  "tone": "${request.tone}"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "당신은 한국 학생들을 위한 상황별 수업 핑계 생성 전문가입니다. 자연스럽고 믿을 만한 핑계를 한국어로 생성해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      excuse: result.excuse || "죄송합니다. 핑계 생성에 실패했습니다.",
      category: selectedCategory,
      tone: request.tone
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Return fallback excuse on any error
    return {
      excuse: fallbackExcuses[selectedCategory as keyof typeof fallbackExcuses] || fallbackExcuses.health,
      category: selectedCategory,
      tone: request.tone
    };
  }
}