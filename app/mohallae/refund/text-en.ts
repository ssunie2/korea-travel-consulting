import type { RefundText } from "./text";

/*
 * 취소·환불 규정 — 영어 글. 고치는 법은 옆 파일 text-ko.ts 맨 위에 적어 두었습니다.
 * 한국어 글과 절(section)의 순서 · id 를 똑같이 맞춰 주세요.
 *
 *   "글" → 문단 · ["글", "글"] → 점 목록 · { note: "글" } → 회색 상자
 *   **굵게** · \n → 줄 바꿈 · {메일} → 연락 메일 · {가격} → 하루 값(한 줄에 하나씩)
 *   '.' 으로 끝난 문장 뒤는 저절로 줄이 바뀝니다
 */
const en: RefundText = {
  updated: "21 November 2026",
  title: "Cancellations & Refunds",
  description: "When you get your money back, and when you don't. If we got it wrong, we make it right.",
  intro:
    "In one line:\nLook at the free first day before you pay. Once a day is open, changing your mind is not a reason for a refund. If we got it wrong, we make it right.",

  sections: [
    {
      id: "what",
      title: "1. What you're buying",
      body: [
        "A travel information document our program writes from your answers. Nothing ships to you; you open it at a link. Each day has several plans, and you open only the days you choose.",
        "**Price per day**\n**{가격}**",
        [
          "As soon as your payment goes through, the days you chose open.",
          "Before you pay, you can see one Day 1 plan in full, free, so you know what you are getting first.",
          "You can also buy just one day first.",
        ],
      ],
    },
    {
      id: "pay",
      title: "2. When you pay",
      body: [
        [
          "**You check once more before paying**\nBefore you pay, we show you the days you chose and the total again. You can change them or stop there.",
          "**You agree first**\nRight above the pay button you will see the refund notice (section 5), and you tick a box to agree before you can pay.",
          "**We email you the order**\nWhen payment is done, we send the order (the days you chose, the amount, the time) and this policy to the email you paid with.",
          "**We keep a record**\nWe record when you agreed and when each day opened. We use it only to check the facts if we ever disagree about a refund.",
        ],
      ],
    },
    {
      id: "full",
      title: "3. When you get all of it back",
      body: [
        [
          "**Your payment went through but your days did not open**\nIf the document never got made, or will not open, you get all of it back.",
          "**You were charged twice for the same order**\nWe refund the extra charge in full.",
        ],
      ],
    },
    {
      id: "wrong",
      title: "4. If we got it wrong",
      body: [
        "If any of these happened, we write it again or give you all of it back, whichever you prefer.",
        [
          "The plan goes to a city you did not ask for",
          "The dates or the length do not match what you told us",
          "We recommended something you told us you cannot eat or cannot reach\nHalal, an allergy, wheelchair access and so on",
          "The document is empty or unreadable",
        ],
        "For these, tell us within 3 months of getting the document, and within 30 days of when you found out (or could have found out) about the problem. Finding out during your trip is fine.",
      ],
    },
    {
      id: "none",
      title: "5. When we can't refund",
      body: [
        "An open day is delivered in full the moment it opens. There is nothing to hand back, so these are not refundable.",
        [
          "You saw an open day and changed your mind",
          "Your trip changed and you are not coming\nThe document was already written",
          "A place we named has closed, changed its price, or its transport changed\nThat is not something we control",
        ],
        {
          note: "**We tell you this before you pay.** Once a day is open, you cannot cancel the purchase just because you changed your mind. This appears right above the pay button, and you tick a box to agree before you can pay.",
        },
      ],
    },
    {
      id: "free",
      title: "6. About the free draft",
      body: [
        "The free draft costs nothing, so there is nothing to refund. If you do not like it, just close it. Fill in the form again if you want another one.",
      ],
    },
    {
      id: "how",
      title: "7. How to ask",
      body: [
        "Email us at {메일}. Tell us the email you paid with and what went wrong. No form, no phone call.",
        "If a refund is due, we cancel the payment within 3 business days of your request. It goes back the way you paid; depending on your bank, it can take a few more days to show.",
        "If we are later than 3 business days, we add late-payment interest of 15% a year for the days we are late.",
      ],
    },
    {
      id: "minor",
      title: "8. If you are under 19",
      body: [
        "If you are under 19 (the age of adulthood in Korea) and paid without the consent of a parent or legal guardian, you or your guardian can cancel the contract. Just email us at {메일}.",
      ],
    },
    {
      id: "help",
      title: "9. If we can't sort it out",
      body: [
        "If talking with us does not solve it, you can ask these Korean public bodies for advice or mediation.",
        [
          "**1372 Consumer Counseling Center** (Korea Consumer Agency)\nwww.ccn.go.kr",
          "**Content Dispute Resolution Committee**\nwww.kcdrc.kr",
        ],
      ],
    },
  ],
};

export default en;
