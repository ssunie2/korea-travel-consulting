// DB에 저장되는 데이터의 모양. supabase/migrations/20260809120000_init.sql 과 짝을 이룬다.
// 한쪽을 바꾸면 다른 쪽도 같이 바꿔야 한다.

/** 손님이 폼(A3)에 넣는 값 */
export type PlanInput = {
  /** 한국 어디를 가는지. 여러 도시를 도는 여행이 많다. 없으면 AI가 일정을 못 만든다 */
  destinations: string[]
  startDate: string // 'YYYY-MM-DD'
  durationDays: number
  travelers: number
  budgetPerPerson?: number
  /** 손님은 해외 여행객이라 달러·유로로 생각한다 */
  budgetCurrency: string
  styles: string[]
  audience?: string
  interests?: string
  /** 할랄·비건·알레르기·휠체어. 이걸 챙기는 게 우리가 돈 받는 이유에 가깝다 */
  dietaryNotes?: string
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
  budget_per_person: number | null
  budget_currency: string
  styles: string[]
  audience: string | null
  interests: string | null
  dietary_notes: string | null
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
