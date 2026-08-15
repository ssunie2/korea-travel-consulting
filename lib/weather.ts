/**
 * 서울 현재 날씨. 랜딩의 하늘 그림과 "지금 서울은" 줄에 쓴다.
 *
 * ⚠️ 출시 전에 갈아타야 한다 — Open-Meteo 무료 등급은 **비상업적 용도**다.
 *    우리는 돈을 받는 사이트이므로 손님을 받기 전에 둘 중 하나로 옮긴다.
 *      · 기상청 단기예보 API (공공데이터포털) — 무료, 상업 이용 가능, 인증키 필요
 *      · Open-Meteo 유료 등급
 *    **갈아탈 자리는 이 파일 하나다.** 부르는 쪽은 안 고쳐도 된다.
 */

/** 우리가 그릴 수 있는 네 가지. 이 밖의 날씨는 가장 가까운 것으로 접는다. */
export type Sky = "clear" | "cloud" | "rain" | "snow";

export type Weather = {
  sky: Sky;
  /** 섭씨. 못 받아오면 null — 그때는 화면에 기온을 아예 안 띄운다 */
  tempC: number | null;
};

/** 날씨를 못 받아도 화면은 떠야 한다. 맑음이 가장 무난하다. */
const FALLBACK: Weather = { sky: "clear", tempC: null };

/** WMO 날씨 코드 → 우리 네 가지. 코드표는 open-meteo.com/en/docs 참고 */
function toSky(code: number): Sky {
  if (code >= 71 && code <= 77) return "snow"; // 눈
  if (code === 85 || code === 86) return "snow"; // 소낙눈
  if (code >= 51 && code <= 67) return "rain"; // 이슬비·비·어는비
  if (code >= 80 && code <= 82) return "rain"; // 소나기
  if (code >= 95) return "rain"; // 뇌우
  if (code >= 2) return "cloud"; // 2·3 구름, 45·48 안개
  return "clear"; // 0·1
}

export async function seoulWeather(): Promise<Weather> {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast" +
        "?latitude=37.5665&longitude=126.978" +
        "&current=weather_code,temperature_2m&timezone=Asia%2FSeoul",
      // 날씨는 10분에 한 번이면 충분하다.
      // 손님이 올 때마다 부르면 화면이 그만큼 늦게 뜨고 호출 한도에도 걸린다.
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return FALLBACK;

    const data = await res.json();
    const code = Number(data?.current?.weather_code);
    const temp = Number(data?.current?.temperature_2m);

    return {
      sky: Number.isFinite(code) ? toSky(code) : "clear",
      tempC: Number.isFinite(temp) ? Math.round(temp) : null,
    };
  } catch {
    // 날씨 서버가 죽어도 랜딩은 떠야 한다
    return FALLBACK;
  }
}
