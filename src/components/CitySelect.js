import axios from "axios"
import csv from "csvtojson"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import Select from "react-select"

export function CitySelect({
  selectedCity,
  setSelectedCity,
  loadingCoronaVirusCases,
  setInfectedCases,
  selectedState
}) {
  const [options, setOptions] = useState([])
  const [citySelectKey, setCitySelectKey] = useState(0)

  useEffect(() => {
    setCitySelectKey(key => key + 1)
    setSelectedCity("")
    const loadOptions = async () => {
      const response = await axios.get(
        "https://raw.githubusercontent.com/wcota/covid19br/master/cases-brazil-cities.csv"
      )
      const citiesCsv = response.data
      csv({
        output: "csv"
      })
        .fromString(citiesCsv)
        .then(function(citiesJson) {
          const splittedCsv = citiesCsv.split(",")
          const cityIndex = splittedCsv.findIndex(item => item === "city")
          const totalCasesIndex = splittedCsv.findIndex(item =>
            item.includes("totalCases")
          )
          const allCities = citiesJson
            .filter(city => city[cityIndex].includes(`/${selectedState}`))
            .map(city => ({
              value: city[cityIndex],
              label: city[cityIndex],
              confirmedCases: city[totalCasesIndex]
            }))

          const sortHigherToLowerConfirmedCases = allCities.sort(function(
            a,
            b
          ) {
            return b.confirmedCases - a.confirmedCases
          })
          setOptions(sortHigherToLowerConfirmedCases)
        })
    }
    loadOptions()
  }, [selectedState])

  const updateCityCases = select => {
    setSelectedCity(select.value)
    setInfectedCases(select.confirmedCases)
  }

  return (
    <Select
      autoFocus
      isLoading={loadingCoronaVirusCases}
      isDisabled={loadingCoronaVirusCases}
      key={citySelectKey}
      options={options}
      placeholder="Selecione ou pesquise uma cidade..."
      onChange={select => updateCityCases(select)}
      noOptionsMessage={() => "Essa cidade não possui nenhum caso confirmado"}
      defaultValue={selectedCity}
      className="mb-5"
    />
  )
}

CitySelect.propTypes = {
  loadingCoronaVirusCases: PropTypes.bool,
  selectedCity: PropTypes.string,
  selectedState: PropTypes.string,
  setInfectedCases: PropTypes.func,
  setSelectedCity: PropTypes.func
}
