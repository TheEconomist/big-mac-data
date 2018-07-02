# Calculating the Big Mac Index

To run the notebook:

### Install Python?

**On a Mac**, you already have Python 2.7 installed, but you should really use Python 3. The best way to install it is with [Homebrew][homebrew]. At terminal, install Homebrew:

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Then install Python 3.x: `brew install python3`

**On Linux** presumably apt-get something

**On Windows** Reformat and install Linux?

### Install Jupyter

Now that you have Python 3 installed, you should also have pip installed. pip is a package manager for Python. You can install [Jupyter][jupyter] with pip:

```
python3 -m pip install jupyter
```

Welcome to Jupyter.

### Install R

**On a Mac**, use Homebrew again: `brew install R`.

**On Linux**, some kind of apt-get thing?

**On Windows**, run away? Run away!

### Install IRkernel

[IRKernel][irkernel] lets you run R code in Jupyter notebooks. This is the best way to work with R code[^There may be some argument on this point, but it is silly and this statement is obviously correct.]. Installation instructions for IRKernel are [here][irkernel installation]. In short:

At a terminal prompt, start R:
```
$ R
> install.packages(c('repr', 'IRdisplay', 'evaluate', 'crayon', 'pbdZMQ', 'devtools', 'uuid', 'digest'))
> devtools::install_github('IRkernel/IRkernel')
> IRkernel::installspec()
```

Congratulations, you can run R in Jupyter.

### Install tidyverse, data.table, countrycode

Finally, our R script uses a few R packages you’ll need to install. The [tidyverse][tidyverse] is a collection of useful packages for data science work in R. [Data.table][data.table] is a complicated but extremely useful alternative to R’s standard data frames for storing and manipulating data. countrycode is a simple function for converting between different systems for encoding countries. At the R prompt from above, run:

```
> install.packages('tidyverse','data.table','countrycode')
```

You’re all set.
  
### Start the notebook

Navigate to the repository on the command line, and run:

```
jupyter notebook
```

You should see a browser window pop up on `http://localhost:8888`.

[homebrew]: https://brew.sh/
[jupyter]: https://jupyter.org
[irkernel]: https://irkernel.github.io/
[irkernel installation]: https://irkernel.github.io/installation/
[tidyverse]: https://www.tidyverse.org/
[data.table]: https://cran.r-project.org/web/packages/data.table/vignettes/datatable-intro.html