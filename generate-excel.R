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
        GDP_dollar,
        dollar_valuation = USD_raw,
        euro_valuation = EUR_raw,
        sterling_valuation = GBP_raw,
        yen_valuation = JPY_raw,
        yuan_valuation = CNY_raw,
        dollar_adj_valuation = USD_adjusted,
        euro_adj_valuation = EUR_adjusted,
        sterling_adj_valuation = GBP_adjusted,
        yen_adj_valuation = JPY_adjusted,
        yuan_adj_valuation = CNY_adjusted
    ), by=date]

dates = data$date %>% unique

wb = createWorkbook(type='xls')

for(sheetDate in sort(dates, decreasing = T)) {
    dateStr = sheetDate %>% strftime(format='%b%Y')
    sheet = createSheet(wb, sheetName = dateStr)
    xlsx.addTable(wb, sheet, data[date == sheetDate, -1], row.names=FALSE, startCol=1)
}

saveWorkbook(wb, paste0('big-mac-',max(dates),'.xls'))