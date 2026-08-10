# Big Mac Index Visualization & API

A modern web application built with **Flask** and **Chart.js** to visualize the globally recognized Big Mac Index. This project provides an interactive Map, historical Charts, and a documented API to explore Purchasing Power Parity (PPP) data from 2000 to 2026.

---

## 🏛️ Data Source & Legal Information

This project is built using the **Official Big Mac Dataset** provided by **The Economist**.

- **Official Source**: [The Economist - Big Mac Data (GitHub)](https://github.com/TheEconomist/big-mac-data)
- **License**: The original data is served under the **MIT License**.
- **Project Purpose**: This website serves as a modern, easy-to-use UI and API layer over the raw CSV data. It is intended for educational and data visualization purposes.

---

## 🚀 Features

- **Interactive Map**: Visualize the cost of a Big Mac across the globe using Leaflet.js.
- **Data Analytics**: Bar charts and time-series plots comparing prices and GDP.
- **RESTful API**: Custom endpoints (`/data`, `/chart_data`, `/country/<CODE>`) to programmatically access the synchronized data.
- **Responsive Design**: Fully glassmorphic, premium "Navy & Gold" theme.

## 🛠️ Contribution

If you want to contribute to this project or the official Economist repository, please check our [GitHub Contribution Guide](./GITHUB_CONTRIBUTION_GUIDE.md).

---

## 📜 Installation & Setup

1. **Clone the repository**
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Run the app**: `python app.py`
4. **Visit**: `http://localhost:8000`F
