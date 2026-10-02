import { useState, useEffect } from 'react'
import {
  CloudSun,
  Video,
  ExternalLink,
  RefreshCw,
  Clock,
  Wind,
  Droplets,
  CloudRain,
  Maximize2,
  CheckCircle2,
  Building2,
  Compass,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/hooks/useI18n'

interface LocationData {
  id: 'thuduc' | 'dian' | 'tanuyen'
  name: string
  province: string
  lat: number
  lon: number
  cameras: CameraItem[]
}

interface CameraItem {
  id: string
  name: string
  route: string
  status: string
  statusType: 'good' | 'warning' | 'busy'
  imgUrl: string
  officialUrl: string
}

interface WeatherCurrent {
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  precipitation: number
  weather_code: number
  wind_speed_10m: number
}

interface AirQualityCurrent {
  us_aqi: number
  pm2_5: number
  pm10: number
}

const LOCATIONS: LocationData[] = [
  {
    id: 'thuduc',
    name: 'TP. Thủ Đức',
    province: 'TP. Hồ Chí Minh',
    lat: 10.8494,
    lon: 106.7537,
    cameras: [
      {
        id: 'td-01',
        name: 'Ngã Tư Thủ Đức',
        route: 'Xa lộ Hà Nội - Lê Văn Việt - Võ Văn Ngân',
        status: 'Thông thoáng',
        statusType: 'good',
        imgUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'http://giaothong.hochiminhcity.gov.vn/',
      },
      {
        id: 'td-02',
        name: 'Vòng Xoay Kha Vạn Cân - Phạm Văn Đồng',
        route: 'Đại lộ Phạm Văn Đồng',
        status: 'Mật độ đông vừa',
        statusType: 'warning',
        imgUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'http://giaothong.hochiminhcity.gov.vn/',
      },
      {
        id: 'td-03',
        name: 'Nút Giao Cát Lái - Mai Chí Thọ',
        route: 'Cửa ngõ Cảng Cát Lái - Cao tốc Long Thành',
        status: 'Xe container di chuyển chậm',
        statusType: 'busy',
        imgUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'http://giaothong.hochiminhcity.gov.vn/',
      },
      {
        id: 'td-04',
        name: 'Ngã Tư Bình Phước',
        route: 'Quốc lộ 1A - Quốc lộ 13',
        status: 'Thông thoáng',
        statusType: 'good',
        imgUrl: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'http://giaothong.hochiminhcity.gov.vn/',
      },
    ],
  },
  {
    id: 'dian',
    name: 'TP. Dĩ An',
    province: 'Bình Dương',
    lat: 10.9069,
    lon: 106.7722,
    cameras: [
      {
        id: 'da-01',
        name: 'Ngã Tư 550 (ĐT743)',
        route: 'ĐT743 - Nguyễn Tri Phương',
        status: 'Lưu thông ổn định',
        statusType: 'good',
        imgUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'https://dian.binhduong.gov.vn/',
      },
      {
        id: 'da-02',
        name: 'Cầu Vượt Sóng Thần',
        route: 'Quốc Lộ 1A - KCN Sóng Thần',
        status: 'Nhiều xe tải',
        statusType: 'warning',
        imgUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'https://dian.binhduong.gov.vn/',
      },
      {
        id: 'da-03',
        name: 'Ngã Sáu An Phú',
        route: 'Vòng xoay ĐT743 - An Phú',
        status: 'Lưu thông bình thường',
        statusType: 'good',
        imgUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'https://dian.binhduong.gov.vn/',
      },
      {
        id: 'da-04',
        name: 'Nút Giao Tân Vạn',
        route: 'Vành đai 3 - Xa Lộ Hà Nội - QL1A',
        status: 'Mật độ cao',
        statusType: 'busy',
        imgUrl: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'https://dian.binhduong.gov.vn/',
      },
    ],
  },
  {
    id: 'tanuyen',
    name: 'TP. Tân Uyên',
    province: 'Bình Dương',
    lat: 11.0825,
    lon: 106.8286,
    cameras: [
      {
        id: 'tu-01',
        name: 'Ngã Ba Nam Tân Uyên',
        route: 'ĐT746 - ĐT747B',
        status: 'Thông thoáng',
        statusType: 'good',
        imgUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'https://tanuyen.binhduong.gov.vn/',
      },
      {
        id: 'tu-02',
        name: 'Vòng Xoay Kim Hằng',
        route: 'Phường Khánh Bình - ĐT746',
        status: 'Xe công nhân & xe tải vừa',
        statusType: 'good',
        imgUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'https://tanuyen.binhduong.gov.vn/',
      },
      {
        id: 'tu-03',
        name: 'Cầu Tân Uyên',
        route: 'Bắc qua sông Đồng Nai - Uyên Hưng',
        status: 'Thông suốt',
        statusType: 'good',
        imgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        officialUrl: 'https://tanuyen.binhduong.gov.vn/',
      },
    ],
  },
]

export function MonitorView() {
  const { t: _t } = useI18n()
  const [filter, setFilter] = useState<'all' | 'thuduc' | 'dian' | 'tanuyen'>('all')
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherCurrent | null>>({})
  const [aqiMap, setAqiMap] = useState<Record<string, AirQualityCurrent | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [previewCam, setPreviewCam] = useState<{ cam: CameraItem; locName: string } | null>(null)

  // Clock
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Weather & AQI from Open-Meteo
  const fetchAllData = async () => {
    setIsLoading(true)
    const lats = LOCATIONS.map((l) => l.lat).join(',')
    const lons = LOCATIONS.map((l) => l.lon).join(',')

    try {
      // 1. Weather
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FBangkok`
      const weatherRes = await fetch(weatherUrl)
      const weatherData = await weatherRes.json()
      const weatherArr = Array.isArray(weatherData) ? weatherData : [weatherData]

      // 2. Air Quality
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=pm10,pm2_5,us_aqi&timezone=Asia%2FBangkok`
      const aqiRes = await fetch(aqiUrl)
      const aqiData = await aqiRes.json()
      const aqiArr = Array.isArray(aqiData) ? aqiData : [aqiData]

      const newWeatherMap: Record<string, WeatherCurrent | null> = {}
      const newAqiMap: Record<string, AirQualityCurrent | null> = {}

      LOCATIONS.forEach((loc, idx) => {
        newWeatherMap[loc.id] = weatherArr[idx]?.current || null
        newAqiMap[loc.id] = aqiArr[idx]?.current || null
      })

      setWeatherMap(newWeatherMap)
      setAqiMap(newAqiMap)
    } catch (err) {
      console.error('Failed to fetch Open-Meteo data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 60000) // auto refresh every 60s
    return () => clearInterval(interval)
  }, [])

  // Weather description mapper
  const getWeatherDesc = (code?: number) => {
    if (code === undefined || code === null) return { text: 'Đang tải...', icon: '⛅' }
    if (code === 0) return { text: 'Trời quang, nắng đẹp', icon: '☀️' }
    if ([1, 2].includes(code)) return { text: 'Ít mây, mát mẻ', icon: '🌤️' }
    if (code === 3) return { text: 'Nhiều mây', icon: '☁️' }
    if ([45, 48].includes(code)) return { text: 'Có sương mù', icon: '🌫️' }
    if ([51, 53, 55, 61, 63].includes(code)) return { text: 'Mưa nhỏ rải rác', icon: '🌦️' }
    if ([65, 80, 81, 82].includes(code)) return { text: 'Mưa rào lớn', icon: '🌧️' }
    if ([95, 96, 99].includes(code)) return { text: 'Giông bão kèm mưa', icon: '⛈️' }
    return { text: 'Thời tiết ổn định', icon: '⛅' }
  }

  // Filtered locations
  const activeLocations = filter === 'all'
    ? LOCATIONS
    : LOCATIONS.filter((l) => l.id === filter)

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Giám Sát Giao Thông & Thời Tiết</h1>
            <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-600 dark:text-blue-400">
              LIVE API
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Dĩ An (Bình Dương) • Thủ Đức (TP.HCM) • Tân Uyên (Bình Dương)
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-2.5">
          <div className="px-3 py-1.5 rounded-xl border border-border/70 bg-card text-xs font-mono flex items-center gap-2 shadow-xs">
            <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>{currentTime || '--:--:--'}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            disabled={isLoading}
            className="text-xs h-8 px-3 rounded-xl border-border/80 hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="text-xs h-8 px-3.5 rounded-xl flex-shrink-0"
        >
          <Compass className="h-3.5 w-3.5 mr-1.5" />
          Tất cả khu vực (3)
        </Button>

        <Button
          variant={filter === 'thuduc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('thuduc')}
          className="text-xs h-8 px-3.5 rounded-xl flex-shrink-0"
        >
          <Building2 className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
          TP. Thủ Đức (TP.HCM)
        </Button>

        <Button
          variant={filter === 'dian' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('dian')}
          className="text-xs h-8 px-3.5 rounded-xl flex-shrink-0"
        >
          <Building2 className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
          TP. Dĩ An (Bình Dương)
        </Button>

        <Button
          variant={filter === 'tanuyen' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('tanuyen')}
          className="text-xs h-8 px-3.5 rounded-xl flex-shrink-0"
        >
          <Building2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
          TP. Tân Uyên (Bình Dương)
        </Button>
      </div>

      {/* 1. Real-time Weather & Air Quality Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
            <CloudSun className="h-4 w-4 text-primary" />
            Thời Tiết & Chất Lượng Không Khí (Open-Meteo)
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">Tự động cập nhật 60s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeLocations.map((loc) => {
            const curW = weatherMap[loc.id]
            const curAQI = aqiMap[loc.id]
            const weatherDesc = getWeatherDesc(curW?.weather_code)

            return (
              <Card key={loc.id} className="border-border/80 shadow-xs relative overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-border/50 flex flex-row items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {loc.province}
                    </span>
                    <CardTitle className="text-base font-bold tracking-tight">
                      {loc.name}
                    </CardTitle>
                  </div>
                  <span className="text-2xl" title={weatherDesc.text}>
                    {weatherDesc.icon}
                  </span>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-3xl font-extrabold tracking-tight">
                        {curW ? `${Math.round(curW.temperature_2m)}°C` : '--'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cảm giác: <span className="font-semibold text-foreground">{curW ? `${Math.round(curW.apparent_temperature)}°C` : '--'}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      {curAQI ? (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold px-2 py-0.5 ${
                            curAQI.us_aqi <= 50
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : curAQI.us_aqi <= 100
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          AQI: {curAQI.us_aqi} ({curAQI.us_aqi <= 50 ? 'Tốt' : curAQI.us_aqi <= 100 ? 'TB' : 'Kém'})
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Đang tải AQI...</span>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">{weatherDesc.text}</p>
                    </div>
                  </div>

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-center text-xs">
                    <div className="p-2 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-center text-muted-foreground gap-1 text-[10px]">
                        <Droplets className="h-3 w-3" />
                        <span>Độ ẩm</span>
                      </div>
                      <p className="font-bold text-foreground mt-0.5">
                        {curW ? `${curW.relative_humidity_2m}%` : '--'}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-center text-muted-foreground gap-1 text-[10px]">
                        <Wind className="h-3 w-3" />
                        <span>Gió</span>
                      </div>
                      <p className="font-bold text-foreground mt-0.5">
                        {curW ? `${curW.wind_speed_10m} km/h` : '--'}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-center text-muted-foreground gap-1 text-[10px]">
                        <CloudRain className="h-3 w-3 text-blue-500" />
                        <span>Lượng mưa</span>
                      </div>
                      <p className="font-bold text-blue-500 mt-0.5">
                        {curW ? `${curW.precipitation} mm` : '--'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* 2. Public Traffic Surveillance Cameras */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border/50 pb-2">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              Mạng Lưới Camera Giao Thông Công Cộng
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hình ảnh cập nhật từ các điểm nút giao thông huyết mạch
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online Feed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeLocations.flatMap((loc) =>
            loc.cameras.map((cam) => (
              <Card
                key={cam.id}
                className="group border-border/80 overflow-hidden shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Video Viewport Container */}
                  <div
                    onClick={() => setPreviewCam({ cam, locName: loc.name })}
                    className="relative bg-black aspect-video overflow-hidden cursor-pointer"
                  >
                    <img
                      src={cam.imgUrl}
                      alt={cam.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Online status tag */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>ONLINE</span>
                    </div>

                    {/* Expand icon */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3 w-3" />
                    </div>

                    {/* Overlay Title */}
                    <div className="absolute bottom-2.5 left-2.5 text-white pr-2">
                      <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                        {loc.name}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold truncate">{cam.name}</h4>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3.5 space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      📍 {cam.route}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          cam.statusType === 'good'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : cam.statusType === 'warning'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {cam.status}
                      </Badge>

                      <span className="text-[10px] text-muted-foreground font-mono">
                        HD 1080p
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-3.5 pb-3 pt-2 border-t border-border/50 flex justify-between items-center text-xs">
                  <a
                    href={cam.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span>Cổng điều hành</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewCam({ cam, locName: loc.name })}
                    className="h-7 text-[11px] px-2.5 rounded-lg"
                  >
                    Xem lớn
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* 3. Official Portals Quick Links */}
      <section className="bg-card border border-border/80 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Cổng Truy Cập Dịch Vụ Công & Camera Giao Thông Chính Thức
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <div className="font-bold text-sm text-blue-600 dark:text-blue-400">TP. Thủ Đức (TP.HCM)</div>
            <p className="text-muted-foreground leading-relaxed">
              Trực thuộc Trung tâm Quản lý Điều hành Giao thông đô thị TP.HCM. Cung cấp hình ảnh trực tiếp hơn 100+ camera.
            </p>
            <div className="pt-1">
              <a
                href="http://giaothong.hochiminhcity.gov.vn/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <span>giaothong.hochiminhcity.gov.vn</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <div className="font-bold text-sm text-amber-600 dark:text-amber-400">TP. Dĩ An (Bình Dương)</div>
            <p className="text-muted-foreground leading-relaxed">
              Trung tâm Giám sát Điều hành Thông minh (IOC Dĩ An) và mạng lưới camera giám sát trên tuyến ĐT743 và QL1A.
            </p>
            <div className="pt-1">
              <a
                href="https://dian.binhduong.gov.vn/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <span>dian.binhduong.gov.vn</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">TP. Tân Uyên (Bình Dương)</div>
            <p className="text-muted-foreground leading-relaxed">
              Hệ thống điều hành camera giao thông kết nối các trục công nghiệp Nam Tân Uyên, ĐT746 và ĐT747B.
            </p>
            <div className="pt-1">
              <a
                href="https://tanuyen.binhduong.gov.vn/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <span>tanuyen.binhduong.gov.vn</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      <Dialog open={!!previewCam} onOpenChange={(open) => !open && setPreviewCam(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border/50">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <div>
                <span>{previewCam?.cam.name}</span>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  {previewCam?.locName} • {previewCam?.cam.route}
                </p>
              </div>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">
                LIVE
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {previewCam && (
            <div className="p-4 space-y-3">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                <img
                  src={previewCam.cam.imgUrl}
                  alt={previewCam.cam.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>LIVE FEED</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white font-mono text-xs px-2.5 py-1 rounded">
                  {currentTime}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">
                  Trạng thái giao thông: <strong className="text-foreground">{previewCam.cam.status}</strong>
                </span>

                <Button
                  size="sm"
                  onClick={() => window.open(previewCam.cam.officialUrl, '_blank')}
                  className="text-xs h-8"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Mở trên cổng điều hành
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
