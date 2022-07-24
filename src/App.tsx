import React from 'react'
import WeatherTable from './components/table/WeatherTable'
import axios from 'axios'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
interface IErrorMessage {}

interface IParameter {
  parameterName: string
  parameterValue: string
}

interface IWeatherElement {
  elementName: string
  elementValue: string
}
interface IReduceWeatherElement {
  TEMP: string
  WDSD: string
  Weather: string
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
  id: number
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
      id: -1,
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
          const locationData = res?.data?.records?.location
          const targetData = locationData.map(
            (data: IFetchData, index: number) => {
              const parameter = data?.parameter.reduce(
                (neededParameter: any, item) => {
                  if (['CITY', 'TOWN'].includes(item.parameterName)) {
                    neededParameter[item.parameterName] = item.parameterValue
                  }
                  return neededParameter
                },
                { CITY: '', TOWN: '' }
              )
              const weatherElements: IReduceWeatherElement =
                data?.weatherElement.reduce(
                  (neededElements: any, item) => {
                    if (
                      ['WDSD', 'TEMP', 'Weather'].includes(item.elementName)
                    ) {
                      neededElements[item.elementName] = item.elementValue
                    }
                    return neededElements
                  },
                  { WDSD: '', TEMP: '', Weather: '' }
                )
              // console.log(weatherElements)
              return {
                id: index,
                county: parameter?.CITY,
                area: parameter?.TOWN,
                observedTime: data?.time?.obsTime,
                weather: weatherElements?.Weather,
                temperature: weatherElements?.TEMP,
                windSpeed: weatherElements?.WDSD,
              }
            }
          )
          setWeatherData(targetData)
        } else {
          setErrorMessage('氣象局api連線不穩請稍後再試')
        }
      })
      .catch((error) => {
        setErrorMessage(error)
        console.log(error)
      })
  }, [])
  const tableWeatherData = React.useMemo(() => weatherData, [])
  const columnHelper = createColumnHelper<IWeatherTableData>()
  const columns = [
    columnHelper.accessor('county', {
      header: (info) => {
        return (
          <>
            <span>縣市</span>
          </>
        )
      },
      cell: (info) => info.getValue(),
      footer: '',
    }),
    columnHelper.accessor('area', {
      header: (info) => {
        return (
          <>
            <span>地區</span>
          </>
        )
      },
      cell: (info) => info.getValue(),
      footer: '',
    }),
    columnHelper.accessor('observedTime', {
      header: (info) => {
        return (
          <>
            <span>觀測時間</span>
          </>
        )
      },
      cell: (info) => {
        return format(new Date(info.getValue()), 'yyyy/MM/dd HH:mm')
      },
      footer: '',
    }),
    columnHelper.accessor('weather', {
      header: (info) => {
        return (
          <>
            <span>天氣</span>
          </>
        )
      },
      cell: (info) => {
        return Number(info.getValue()) === -99 ? '儀器故障' : info.getValue()
      },
      footer: '',
    }),
    columnHelper.accessor('temperature', {
      header: (info) => {
        return (
          <>
            <span>溫度</span>
          </>
        )
      },
      cell: (info) => {
        return Number(info.getValue()) === -99 ? '儀器故障' : info.getValue()
      },
      footer: '',
    }),
    columnHelper.accessor('windSpeed', {
      header: (info) => {
        return (
          <>
            <span>風速</span>
          </>
        )
      },
      cell: (info) => {
        return Number(info.getValue()) === -99 ? '儀器故障' : info.getValue()
      },
      footer: '',
    }),
    columnHelper.accessor('id', {
      header: '',
      cell: (info) => {
        return (
          <>
            <button onClick={() => console.log(info)}>test</button>
          </>
        )
      },
      footer: '',
    }),
  ]
  return (
    <>
      <div className='w-full h-[100vh] flex flex-row justify-center p-10 bg-gradient-to-b from-[#70bde0] to-[#FFFFFF]'>
        <div className='w-[80%] max-h-[75%]'>
          <WeatherTable data={tableWeatherData} columns={columns} />
        </div>
      </div>
    </>
  )
}
