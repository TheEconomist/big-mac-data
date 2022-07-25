# The Big Mac index

This repository contains the data behind _The Economist’s_ Big Mac index, and code that shows how we calculate it. To download the data, go to the [latest release][latest release], where you can download the index data in a CSV or Excel, or the [code behind it][notebook link].

## Methodology changes

In July 2022 we updated the Big Mac index to use a McDonalds-provided price for the United States (previously, we averaged the price from four major US cities). We also changed how we calculate the GDP-adjusted index. Instead of using the IMF's calculation of purchasing-power parity, we adjust the GDP per person by the difference in each country's Big Mac prices. The full history of the GDP-adjusted series will now be updated whenever the IMF’s historical GDP series are updated, which means the GDP series for a given year may change slightly over time as the IMF refines its measurements. The previously published versions of both indices are available in the [releases](https://github.com/TheEconomist/big-mac-data/releases).

## Source data

Our source data are from several places. Big Mac prices are from McDonald’s directly and from reporting around the world; exchange rates are from Thomson Reuters (until January 2022) and Refinitiv Datastream (July 2022 on); GDP and population data used to calculate the euro area averages are from Eurostat and GDP per person data are from the IMF World Economic Outlook reports.

## Output data

The script provides data in three files:

- `big-mac-raw-index.csv` contains values for the “raw” index
- `big-mac-adjusted-index.csv` contains values for the “adjusted” index
- `big-mac-full-index.csv` contains both

Each file also contains the source data used to calculate it.

#### Codebook

This codebook largely applies to all three files. The exception is the variables suffixed "\_raw" or "\_adjusted"—these appear (with suffixes) in the "full" file but without suffixes in the respective ("raw" or "adjusted") files.

| variable      | definition                                            | source                     |
| ------------- | ----------------------------------------------------- | -------------------------- |
| date          | Date of observation                                   |
| iso_a3        | Three-character [ISO 3166-1 country code][iso 3166-1] |
| currency_code | Three-character [ISO 4217 currency code][iso 4217]    |
| name          | Country name                                          |
| local_price   | Price of a Big Mac in the local currency              | McDonalds; _The Economist_ |
| dollar_ex     | Local currency units per dollar                       | _Reuters_                  |
| dollar_price  | Price of a Big Mac in dollars                         |
| USD_raw       | Raw index, relative to the US dollar                  |
| EUR_raw       | Raw index, relative to the Euro                       |
| GBP_raw       | Raw index, relative to the British pound              |
| JPY_raw       | Raw index, relative to the Japanese yen               |
| CNY_raw       | Raw index, relative to the Chinese yuan               |
| GDP_dollar    | GDP per person, in dollars                            | IMF                        |
| adj_price     | GDP-adjusted price of a Big Mac, in dollars           |
| USD_adjusted  | Adjusted index, relative to the US dollar             |
| EUR_adjusted  | Adjusted index, relative to the Euro                  |
| GBP_adjusted  | Adjusted index, relative to the British pound         |
| JPY_adjusted  | Adjusted index, relative to the Japanese yen          |
| CNY_adjusted  | Adjusted index, relative to the Chinese yuan          |

## Calculating the Big Mac index

The code to calculate the index is provided as a [Jupyter Notebook][jupyter]. The code itself is written in R, a programming language designed for data manipulation and statistics. You can view the [notebook][notebook link] on github.

If you want to run the notebook, you’ll need to set up a few things:

### Install Python

You can refer to the installation instructions at the [Hitchhiker’s Guide to Python][h2g2py install]

**On a Mac**, you already have Python 2.7 installed, but it does not come with Python’s package manager. We recommend using Python 3. To install it, we recommend using [Homebrew][homebrew]. In terminal, install Homebrew:

```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Then, use Homebrew to install Python 3.x:

```
$ brew install python3
```

**On Ubuntu Linux** you can use aptitude:

```
$ sudo apt-get update
$ sudo apt-get install python3.6
```

**On Windows**, instructions coming.

### Install Jupyter

**On Mac or Linux**, you should now also have pip installed. pip is a package manager for Python. You can install [Jupyter][jupyter] with pip:

```
$ python3 -m pip install jupyter
```

You’re all set. (If you are using Python 2, run `python -m pip install jupyter`.)

**On Windows**, instructions coming.

### Install R

**On a Mac**, use Homebrew again. At a terminal prompt, run:

```
$ brew install R
```

**On Ubuntu Linux**, you’re recommended to add a new source to your aptitude setup to install R. Run:

```
$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9
```

Once you have added the key, add R repository (called CRAN):

```
$ sudo add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/'
```

Now, you can install R:

```
$ sudo apt-get update
$ sudo apt-get install r-base
```

**On Windows**, instructions coming.

### Install IRkernel

[IRKernel][irkernel] lets you run R code in Jupyter notebooks. This is the best way to work with R code (this is a truth not yet universally acknowledged). Installation instructions for IRKernel are [here][irkernel installation]. In short:

At a terminal prompt, start R:

```
$ R
> install.packages(c('repr', 'IRdisplay', 'evaluate', 'crayon', 'pbdZMQ', 'devtools', 'uuid', 'digest'))
> devtools::install_github('IRkernel/IRkernel')
> IRkernel::installspec()
```

Congratulations, you can run R in Jupyter.

### Install tidyverse and data.table

Finally, our R script uses a few R packages you’ll need to install. The [tidyverse][tidyverse] is a collection of useful packages for data science work in R. [Data.table][data.table] is a complicated but extremely useful alternative to R’s standard data frames for storing and manipulating data. At the R prompt from above, run:

```
> install.packages(c('tidyverse','data.table'))
```

You’re all set.

### Start the notebook

Navigate to the repository on the command line, and run:

```
$ jupyter notebook
```

You should see a browser window pop up on `http://localhost:8888`. Click on “Big Mac data generator” to launch the notebook.

To run the notebook, you can run the code cell by cell by clicking on the first cell and using <kbd>shift</kbd>+<kbd>enter</kbd> to run each cell in turn. Or you can run the whole thing by clicking on the “Cell” menu and selecting “Run All”.

### R script

We also include the calculation as a bare R script (`data-generator.R`) if you just want to run the code, but this doesn't explain what the code does or walk you through it. To run this, you'll only need to install R, tidyverse, and data.table; once those are installed, you can just run

```
$ R data-generator-v2.R
```

to calculate the index files. (The R script may generate numbers that are different at the last decimal place to those from the Python notebook—these differences are due to rounding errors and can be safely ignored.)

### Licence

This software is published by _[The Economist](https://www.economist.com)_ under the [MIT licence](https://opensource.org/licenses/MIT). The data generated by _The Economist_ are available under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

The licences include only the data and the software authored by _The Economist_, and do not cover any _Economist_ content or third-party data or content made available using the software. More information about licensing, syndication and the copyright of _Economist_ content can be found [here](https://www.economist.com/rights/).

[releases]: https://github.com/theeconomist/big-mac-data/releases
[latest release]: https://github.com/theeconomist/big-mac-data/releases/latest
[notebook link]: https://github.com/theeconomist/big-mac-data/blob/master/Big%20Mac%20data%20generator.ipynb
[homebrew]: https://brew.sh/
[h2g2py install]: http://docs.python-guide.org/en/latest/starting/installation/
[h2g2py windows install]: http://docs.python-guide.org/en/latest/starting/install3/win/#install3-windows
[jupyter]: https://jupyter.org
[irkernel]: https://irkernel.github.io/
[irkernel installation]: https://irkernel.github.io/installation/
[tidyverse]: https://www.tidyverse.org/
[data.table]: https://cran.r-project.org/web/packages/data.table/vignettes/datatable-intro.html
[iso 3166-1]: https://www.iso.org/iso-3166-country-codes.html
[iso 4217]: https://www.iso.org/iso-4217-currency-codes.html
