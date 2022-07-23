import React from 'react'
import WeatherTable from '@components/table/WeatherTable'
import axios from 'axios'

interface IErrorMessage {}

interface IParameter {
  parameterName: string
  parameterValue: string
}

interface IWeatherElement {
  elementName: string
  elementValue: string
}

interface IFetchData {
  lat: string
  locationName: string
  lon: string
  parameter: IParameter[]
  stationId: string
  time: {
    obsTime: string
  }
  weatherElement: IWeatherElement[]
}

interface IWeatherTableData {
  county: string //  縣市
  area: string //  地區
  observedTime: Date | string //  觀測時間
  weather: string //  天氣
  temperature: string //  溫度
  windSpeed: string ///  風速
}

export default function App() {
  const AUTHORIZATION_KEY = process.env.REACT_APP_AUTHORIZATION_KEY
  const [errorMessage, setErrorMessage] = React.useState('')
  const [weatherData, setWeatherData] = React.useState<IWeatherTableData[]>([
    {
      county: '',
      area: '',
      observedTime: '',
      weather: '',
      temperature: '',
      windSpeed: '',
    },
  ])
  React.useEffect(() => {
    axios
      .get(
        `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}`
      )
      .then((res) => {
        if (res.data.success) {
          console.log(res?.data?.records?.location)
          const targetData = res?.data?.records?.location.map(
            (data: IFetchData) => {
              const county = data.parameter.find((item) => {
                return item.parameterName === 'CITY'
              })
              return {
                county: county?.parameterValue,
                area: '',
                observedTime: '',
                weather: '',
                temperature: '',
                windSpeed: '',
              }
            }
          )
        } else {
          setErrorMessage('氣象局api連線不穩請稍後再試')
        }
      })
      .catch((error) => {
        setErrorMessage(error)
        console.log(error)
      })
  }, [])

  return (
    <>
      <div className='w-full h-full flex flex-row justify-center p-10 bg-gradient-to-b from-[#e6f7ff] to-[#FFFFFF]'>
        <div className='w-[80%]'>
          {/* <WeatherTable data={[]} columns={[]} /> */}
        </div>
      </div>
    </>
  )
}
