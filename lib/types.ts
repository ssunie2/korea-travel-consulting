// DB에 저장되는 데이터의 모양. supabase/migrations/20260809120000_init.sql 과 짝을 이룬다.
// 한쪽을 바꾸면 다른 쪽도 같이 바꿔야 한다.

/** 손님이 폼(A3)에 넣는 값 */
export type PlanInput = {
  /** 한국 어디를 가는지. 여러 도시를 도는 여행이 많다. 없으면 AI가 일정을 못 만든다 */
  destinations: string[]
  startDate: string // 'YYYY-MM-DD'
  durationDays: number
  travelers: number
  /**
   * 1인 예산 **구간**. 숫자가 아니라 '10–15만원 (약 $75–110)' 같은 글자다 —
   * 손님은 한국 물가를 몰라 숫자를 적기 어렵고, 우리도 정확한 액수보다
   * 어느 급인지만 알면 일정을 짤 수 있다.
   */
  budgetRange?: string
  /** 옛 숫자 칸. 구간으로 바뀌기 전 초안들에 값이 남아 있다 */
  budgetPerPerson?: number
  /** 비용을 어느 돈으로 보여줄지. 손님은 해외 여행객이라 달러·유로로 읽는다 */
  budgetCurrency: string
  styles: string[]
  audience?: string

  /**
   * 아래 일곱 가지는 **문서의 짜임을 바꾸는 답들이다.** 전부 객관식이라 짧은 글자다.
   * 같은 도시라도 이 값에 따라 하루에 넣는 일정 수, 동선, 시작 시각이 달라진다.
   */
  /** 빡빡하게 / 보통 / 여유롭게 — 하루에 넣는 일정 개수가 달라진다 */
  pace?: string
  /** 처음인지 다시 오는지 — 처음이면 경복궁, 다시면 덜 알려진 곳 */
  visitedBefore?: string
  /** 지하철·버스 / 렌터카 / 택시 — 추천 동선이 통째로 달라진다 */
  transport?: string
  /** 도심 / 조용한 동네 — 숙소를 고르는 기준 */
  stayArea?: string
  /** 일찍 시작 / 늦게 시작 — 시간표의 첫 시각 */
  dayRhythm?: string
  /** 생일·기념일·신혼여행 같은 것 */
  occasion?: string
  /** 사람 많은 곳, 계단, 긴 이동처럼 빼 달라는 것들 */
  avoid?: string[]

  /**
   * 할랄·비건·알레르기·휠체어. 이걸 챙기는 게 우리가 돈 받는 이유에 가깝다.
   *
   * ⚠️ **건강·종교 정보다.** AI 무료 등급에서는 넣은 내용이 학습에 쓰이고 사람이 볼 수 있다.
   *    손님을 받기 전에 유료 등급으로 올려야 한다.
   */
  dietary?: string[]
  language: string
}

/**
 * AI가 만드는 무료 초안. **전체 컨설팅의 1/3만 담는다** (이슈 #2)
 * 나머지(팁 전부, 추천 5곳, 비용 분해, 포토스팟, 옷차림)는 유료 상담에서 준다.
 * 여기에 항목을 늘리기 전에 "이걸 공짜로 주면 상담을 살까?"를 먼저 따진다.
 */
export type FreeItinerary = {
  tripTitle: string
  summary: string
  days: {
    dayNumber: number
    theme: string
    /**
     * 그날 머무는 도시. 여러 도시를 도는 여행에서 **오늘 짐을 옮기는지**를 알려준다.
     * 물음표가 붙은 이유 — 이 칸이 생기기 전에 만들어진 초안에는 없다.
     */
    city?: string
    /** 아침·오후·저녁 각 1개, 총 3개 */
    activities: { time: string; name: string; note: string }[]
  }[]
  /** 전체에서 딱 1개만 보여주는 맛보기 팁 */
  sampleTip: {
    activityName: string
    highlight: string
    pitfall: string
    insiderSecret: string
  }
  /** 숙소·식당 각 1곳, 이름만 */
  picks: { stay: string; dining: string }
  /** 총액만. 항목별 분해는 유료 */
  totalEstimate: string
}

/**
 * 유료로 파는 전체 일정.
 *
 * 우리가 파는 것은 "정보량"이 아니라 **분석 결과**다.
 * ① 최적 동선 — 같은 곳을 두 번 오가지 않게 지역별로 묶고 이동 시간을 줄인다
 * ② 예산 대비 최선 — 같은 돈으로 더 나은 선택을 짚어준다
 * 항목을 늘릴 때 이 둘에 기여하지 않으면 넣지 않는다.
 */
export type FullItinerary = {
  tripTitle: string
  summary: string
  days: {
    dayNumber: number
    theme: string
    /**
     * 그날 머무는 도시. 여러 도시를 도는 여행에서 **오늘 짐을 옮기는지**를 알려준다.
     * 물음표가 붙은 이유 — 이 칸이 생기기 전에 만들어진 초안에는 없다.
     */
    city?: string
    /** 지역으로 묶은 결과. "왜 이 순서인지"가 우리가 파는 것이다 */
    area: string
    routeNote: string
    /** 무료는 하루 3개로 묶었지만 여기는 실제 하루만큼 넣는다 */
    activities: {
      time: string
      name: string
      description: string
      duration?: string
      location?: string
      estimatedCost?: string
      /** 앞 장소에서 여기까지 어떻게·몇 분 */
      gettingThere?: string
      /** 무료에서는 전체에 1개만 줬다. 여기는 활동마다 붙는다 */
      tips: {
        highlight: string
        pitfall: string
        insiderSecret: string
        reservationRequired: boolean
      }
    }[]
    photoSpot?: { name: string; bestTime: string; advice: string }
  }[]
  /** 각 5곳. 무료는 이름만 1곳씩이었다 */
  picks: {
    stay: PlaceRecommendation[]
    dining: PlaceRecommendation[]
    cafes: PlaceRecommendation[]
  }
  /** 무료는 총액만 줬다 */
  costBreakdown: {
    totalEstimate: string
    accommodation: string
    dining: string
    transport: string
    activities: string
    /** 손님이 적은 예산과 견줘서 남는지 모자라는지 */
    budgetFit: string
    /** 같은 돈으로 더 나은 선택 — 이게 "가성비 분석"의 결과물이다 */
    valueMoves: string[]
  }
  clothing: { weatherSummary: string; outfits: string[]; advice: string }
  packingTips: string[]
}

export type PlaceRecommendation = {
  name: string
  area: string
  priceLevel: string
  reason: string
}

/** plans 테이블 한 줄 */
export type Plan = {
  id: string
  created_at: string
  destinations: string[]
  start_date: string
  duration_days: number
  travelers: number
  budget_range: string | null
  budget_per_person: number | null
  budget_currency: string
  styles: string[]
  audience: string | null
  pace: string | null
  visited_before: string | null
  transport: string | null
  stay_area: string | null
  day_rhythm: string | null
  occasion: string | null
  avoid: string[] | null
  dietary: string[] | null
  /** 옛 자유 입력 칸. 객관식(dietary)으로 바뀌기 전에 들어온 값이 남아 있다 */
  dietary_notes: string | null
  interests: string | null
  language: string
  itinerary: FreeItinerary | null
}

export type ConsultationStatus = 'received' | 'in_progress' | 'done' | 'cancelled'

/** consultations 테이블 한 줄 */
export type Consultation = {
  id: string
  created_at: string
  plan_id: string | null
  name: string
  email: string
  messenger: string | null
  message: string | null
  status: ConsultationStatus
}

/** inquiries 테이블 한 줄 */
export type Inquiry = {
  id: string
  created_at: string
  email: string
  message: string
}
