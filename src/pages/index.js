import React, { useState } from "react"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { CitySelect } from "../components/CitySelect"
import Card from "../components/InfoCard"
import Layout from "../components/Layout"
import { LoadingChart } from "../components/LoadingChart"
import SEO from "../components/Seo"
import { StateSelect } from "../components/StateSelect"
import {
  useCoronavirusData,
  useCoronavirusHistoryData,
} from "../utils/customHooks"

export default function Index() {
  const [selectedState, setSelectedState] = useState("")
  const [selectKey, setSelectKey] = useState(0)
  const [selectedCity, setSelectedCity] = useState("")
  const [infectedCases, setInfectedCases] = useState(0)
  const [deceasedCases, setDeceasedCases] = useState(0)
  const {
    brazilCoronavirusCases,
    loadingCoronaVirusCases,
  } = useCoronavirusData(setInfectedCases, setDeceasedCases, selectKey)
  const { casesByDay, loadingCasesByDay } = useCoronavirusHistoryData(
    selectedState,
    selectedCity
  )

  const deathsByDayGreaterThanZero = () =>
    casesByDay.filter((caseByDay) => caseByDay.deaths > 0)

  const memoizedDeathsByDayGreaterThanZero = React.useMemo(
    () => deathsByDayGreaterThanZero(casesByDay),
    [casesByDay]
  )
  return (
    <Layout>
      <SEO keywords={["coronavirus", "brasil", "casos"]} title="Home" />
      {
        <StateSelect
          {...{
            loadingCoronaVirusCases,
            setSelectedState,
            selectedState,
            setInfectedCases,
            setDeceasedCases,
            brazilCoronavirusCases,
            selectKey,
            setSelectKey,
          }}
        />
      }
      {selectedState && (
        <CitySelect
          {...{
            selectedCity,
            setSelectedCity,
            loadingCoronaVirusCases,
            setInfectedCases,
            selectedState,
          }}
        />
      )}
      {(selectedState || selectedCity) && (
        <div>
          <button
            className="text-white mb-5 text-lg"
            onClick={() => {
              setSelectedState("")
              setSelectedCity("")
              setSelectKey((key) => key + 1)
            }}
          >
            Voltar para os dados do Brasil
          </button>
        </div>
      )}
      <span className="text-xl text-gray-400 mb-5 text-center">
        {!selectedCity && !selectedState
          ? "Dados - Brasil"
          : selectedState && !selectedCity
          ? `Dados - ${selectedState}`
          : `Dados - ${selectedCity}`}
      </span>

      <div className="flex flex-wrap">
        <Card
          title="Casos confirmados"
          className={
            !selectedCity
              ? "max-w w-full md:w-1/2 md:pr-5"
              : "max-w w-full md:pr-5"
          }
          loadingCoronaVirusCases={loadingCoronaVirusCases}
          description={infectedCases}
        />

        {!selectedCity && (
          <Card
            className="max-w w-full md:w-1/2"
            loadingCoronaVirusCases={loadingCoronaVirusCases}
            title="Mortes"
            description={deceasedCases}
          />
        )}
      </div>
      <LoadingChart
        loading={loadingCasesByDay}
        chartData={casesByDay}
        chartTitle="Relatório diário casos"
      >
        <LineChart
          data={casesByDay}
          margin={{
            left: 0,
            right: 16,
            top: 24,
            bottom: 24,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            textAnchor="middle"
            tick={{
              fontSize: 16,
              angle: -25,
              stroke: "white",
            }}
            tickMargin={20}
          />
          <YAxis dataKey="confirmed" />
          <Tooltip label="date" />
          <Line dataKey="confirmed" name="Casos confirmados" stroke="#e74c3c" />
          <Line dataKey="newCases" name="Novos casos" stroke="#f57c00" />
          <Line
            dataKey={(key) =>
              `${((key.newCases / key.confirmed) * 100).toFixed(2)}%`
            }
            name="Porcentagem crescimento dia"
            stroke="blue"
          />
        </LineChart>
      </LoadingChart>
      {!selectedCity && (
        <LoadingChart
          loading={loadingCasesByDay}
          chartData={casesByDay}
          chartTitle="Relatório diário mortes"
        >
          <LineChart
            data={memoizedDeathsByDayGreaterThanZero}
            margin={{
              left: 0,
              right: 16,
              top: 24,
              bottom: 24,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              textAnchor="middle"
              tick={{
                fontSize: 16,
                angle: -25,
                stroke: "white",
              }}
              tickMargin={20}
            />
            <YAxis dataKey="deaths" />
            <Tooltip label="date" />
            <Line dataKey="deaths" name="Mortes confirmadas" stroke="#e74c3c" />
            <Line dataKey="newDeaths" name="Novas mortes" stroke="#f57c00" />
            <Line
              dataKey={(key) =>
                `${((key.newDeaths / key.deaths) * 100).toFixed(2)}%`
              }
              name="Porcentagem crescimento dia"
              stroke="blue"
            />
          </LineChart>
        </LoadingChart>
      )}
      <span className="text-gray-400 text-left mt-5">
        Fonte: Ministério da saúde
      </span>
    </Layout>
  )
}
