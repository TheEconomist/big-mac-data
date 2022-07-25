# This script generates the Excel file for download
library('r2excel')
library('magrittr')
library('data.table')

data = fread('./output-data/big-mac-full-index.csv') %>%
    .[, .(
        Country = name,
        iso_a3,
        currency_code,
        local_price,
        dollar_ex,
        dollar_price,
        dollar_ppp = dollar_ex * dollar_price / .SD[currency_code == 'USD']$dollar_price,
        GDP_bigmac,
        dollar_valuation = USD_raw * 100,
        euro_valuation = EUR_raw * 100,
        sterling_valuation = GBP_raw * 100,
        yen_valuation = JPY_raw * 100,
        yuan_valuation = CNY_raw * 100,
        dollar_adj_valuation = USD_adjusted * 100,
        euro_adj_valuation = EUR_adjusted * 100,
        sterling_adj_valuation = GBP_adjusted * 100,
        yen_adj_valuation = JPY_adjusted * 100,
        yuan_adj_valuation = CNY_adjusted * 100
    ), by=date]

dates = data$date %>% unique %>% sort(., decreasing = T)

wb = createWorkbook(type='xls')

for(sheetDate in seq_along(dates)) {
    dateStr = dates[sheetDate] %>% strftime(format='%b%Y')
    sheet = createSheet(wb, sheetName = dateStr)
    xlsx.addTable(wb, sheet, data[date == dates[sheetDate], -1], row.names=FALSE, startCol=1)
}

saveWorkbook(wb, paste0('./output-data/big-mac-',max(dates),'.xls'))
