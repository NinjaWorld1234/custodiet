
interface WeatherData {
    temp_c: number;
    wind_kph: number;
    condition: string;
}

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export const fetchEventWeather = async (lat: number, lon: number, time?: string): Promise<WeatherData | null> => {
    try {
        // OpenMeteo requires YYYY-MM-DD
        // If time is old, we might need 'historical' API, but for MVP we fetch 'current' or 'forecast'
        // For simplicity in MVP, we fetch "current weather" at that location to assess *ongoing* impact

        const response = await fetch(`${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (!response.ok) throw new Error('Weather API Error');

        const data = await response.json();
        const current = data.current_weather;

        return {
            temp_c: current.temperature,
            wind_kph: current.windspeed,
            condition: interpretWeatherCode(current.weathercode)
        };

    } catch (error) {
        console.warn('Weather fetch failed:', error);
        return null; // Fail gracefully, don't break the whole app
    }
};

const interpretWeatherCode = (code: number): string => {
    // WMO Weather interpretation codes (http://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
    if (code === 0) return 'Clear sky';
    if (code < 4) return 'Partly cloudy';
    if (code < 50) return 'Fog';
    if (code < 60) return 'Drizzle';
    if (code < 70) return 'Rain';
    if (code < 80) return 'Snow';
    if (code < 90) return 'Showers';
    if (code >= 95) return 'Thunderstorm/Hail';
    return 'Unknown';
};
