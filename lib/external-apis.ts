const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

export interface JokeInspiration {
  text: string;
  category: string;
  source: string;
}

export async function fetchCleanStandupJoke(): Promise<JokeInspiration | null> {
  try {
    const response = await fetch(
      "https://v2.jokeapi.dev/joke/Any?type=single&blacklistFlags=nsfw,racist,sexist,explicit",
      {
        next: { revalidate: 60 * 60 },
        headers: { Accept: "application/json" }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: { joke?: string; category?: string } = await response.json();
    if (!data.joke) {
      return null;
    }

    return {
      text: data.joke,
      category: data.category ?? "Any",
      source: "JokeAPI"
    };
  } catch (error) {
    console.error("Failed to fetch joke inspiration", error);
    return null;
  }
}

export interface GigWeatherSummary {
  description: string;
  maxTempC: number;
  minTempC: number;
  precipitationChance: number | null;
  timezone: string;
  localDate: string;
}

export async function fetchGigWeatherSummary(
  city: string,
  region: string | null,
  eventDate: Date
): Promise<GigWeatherSummary | null> {
  const search = [city, region].filter(Boolean).join(", ");
  if (!search) {
    return null;
  }

  const targetDate = eventDate.toISOString().split("T")[0];

  try {
    const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodeUrl.searchParams.set("name", search);
    geocodeUrl.searchParams.set("count", "1");
    geocodeUrl.searchParams.set("language", "en");

    const geocodeResponse = await fetch(geocodeUrl, { next: { revalidate: 60 * 60 * 24 } });
    if (!geocodeResponse.ok) {
      return null;
    }

    const geocodeData: {
      results?: { latitude: number; longitude: number; name: string; timezone?: string }[];
    } = await geocodeResponse.json();

    const location = geocodeData.results?.[0];
    if (!location) {
      return null;
    }

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", location.latitude.toString());
    forecastUrl.searchParams.set("longitude", location.longitude.toString());
    forecastUrl.searchParams.set("daily", "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_mean");
    forecastUrl.searchParams.set("timezone", "auto");
    forecastUrl.searchParams.set("start_date", targetDate);
    forecastUrl.searchParams.set("end_date", targetDate);

    const forecastResponse = await fetch(forecastUrl, { next: { revalidate: 60 * 60 } });
    if (!forecastResponse.ok) {
      return null;
    }

    const forecastData: {
      timezone?: string;
      daily?: {
        weathercode?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_probability_mean?: number[];
        time?: string[];
      };
    } = await forecastResponse.json();

    if (!forecastData.daily || !forecastData.daily.time || forecastData.daily.time.length === 0) {
      return null;
    }

    const description = WEATHER_CODE_DESCRIPTIONS[forecastData.daily.weathercode?.[0] ?? -1] ?? "Forecast unavailable";

    return {
      description,
      maxTempC: forecastData.daily.temperature_2m_max?.[0] ?? 0,
      minTempC: forecastData.daily.temperature_2m_min?.[0] ?? 0,
      precipitationChance: forecastData.daily.precipitation_probability_mean?.[0] ?? null,
      timezone: forecastData.timezone ?? "local",
      localDate: forecastData.daily.time[0]
    };
  } catch (error) {
    console.error("Failed to fetch gig weather", error);
    return null;
  }
}
