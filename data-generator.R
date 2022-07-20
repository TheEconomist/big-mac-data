library('tidyverse')
library('data.table')

big_mac_countries = c('ARG', 'AUS', 'BRA', 'GBR', 'CAN', 'CHL', 'CHN', 'CZE', 'DNK',
                      'EGY', 'HKG', 'HUN', 'IDN', 'ISR', 'JPN', 'MYS', 'MEX', 'NZL',
                      'NOR', 'PER', 'PHL', 'POL', 'RUS', 'SAU', 'SGP', 'ZAF', 'KOR',
                      'SWE', 'CHE', 'TWN', 'THA', 'TUR', 'ARE', 'USA', 'COL', 'CRI',
                      'PAK', 'LKA', 'UKR', 'URY', 'IND', 'VNM', 'GTM', 'HND', 'VEN',
                      'NIC', 'AZE', 'BHR', 'HRV', 'JOR', 'KWT', 'LBN', 'MDA', 'OMN',
                      'QAT', 'ROU', 'EUZ')
base_currencies = c('USD', 'EUR', 'GBP', 'JPY', 'CNY')

big_mac_data = fread('./source-data/big-mac-source-data.csv', na.strings = '#N/A',
                     # sort by date and then by country name, for easy reading;
                     # index on currency_code for faster joining
                     key = 'date,name', index = 'currency_code') %>%
  # remove lines where the local price is missing
  .[!is.na(local_price)]

big_mac_data[, dollar_price := local_price / dollar_ex]

big_mac_index = big_mac_data[
    !is.na(dollar_price) & iso_a3 %in% big_mac_countries
    ,.(date, iso_a3, currency_code, name, local_price, dollar_ex, dollar_price)]

for(currency in base_currencies) {
  big_mac_index[
    ,
    (currency) := dollar_price / .SD[currency_code == currency]$dollar_price - 1,
    by=date
  ]
}
big_mac_index[, (base_currencies) := lapply(.SD, round, 5L), .SDcols=base_currencies]

fwrite(big_mac_index, './output-data/big-mac-raw-index-old.csv')

big_mac_gdp_data = big_mac_data[GDP_dollar > 0]

regression_countries = c('ARG', 'AUS', 'BRA', 'GBR', 'CAN', 'CHL', 'CHN', 'CZE', 'DNK',
                         'EGY', 'EUZ', 'HKG', 'HUN', 'IDN', 'ISR', 'JPN', 'MYS', 'MEX',
                         'NZL', 'NOR', 'PER', 'PHL', 'POL', 'RUS', 'SAU', 'SGP', 'ZAF',
                         'KOR', 'SWE', 'CHE', 'TWN', 'THA', 'TUR', 'USA', 'COL', 'PAK',
                         'IND', 'AUT', 'BEL', 'NLD', 'FIN', 'FRA', 'DEU', 'IRL', 'ITA',
                         'PRT', 'ESP', 'GRC', 'EST')
# in 2021, we added a number of additional countries to the adjusted index
regression_addons_2021 = c('ARE', 'CRI', 'LKA', 'UKR', 'URY', 'VNM', 'GTM', 'HND', 'NIC',
                           'AZE', 'BHR', 'HRV', 'JOR', 'KWT', 'MDA', 'OMN', 'QAT', 'ROU',
                           'SVK', 'SVN', 'LVA', 'LTU')
big_mac_gdp_data = big_mac_gdp_data[iso_a3 %in% regression_countries |
  (iso_a3 %in% regression_addons_2021 & date >= as.Date('2021-01-01'))
]

big_mac_gdp_data[,adj_price := lm(dollar_price ~ GDP_dollar)$fitted.values, by=date]

big_mac_adj_index = big_mac_gdp_data[
  !is.na(dollar_price) & iso_a3 %in% big_mac_countries
  ,.(date, iso_a3, currency_code, name, local_price, dollar_ex, dollar_price, GDP_dollar, adj_price)]

for(currency in base_currencies) {
  big_mac_adj_index[
    ,
    (currency) := (dollar_price / adj_price) /
      .SD[currency_code == currency, dollar_price / adj_price] - 1,
    by=date
  ]
}
big_mac_adj_index[, (base_currencies) := lapply(.SD, round, 5L), .SDcols=base_currencies]

fwrite(big_mac_adj_index, './output-data/big-mac-adjusted-index-old.csv')

big_mac_full_index = merge(big_mac_index, big_mac_adj_index,
  by=c('date', 'iso_a3', 'currency_code', 'name', 'local_price', 'dollar_ex', 'dollar_price'),
  suffixes=c('_raw', '_adjusted'),
  all.x=TRUE
  )

fwrite(big_mac_full_index, './output-data/big-mac-full-index-old.csv')
