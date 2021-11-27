# CryptoCharts Server

## How It Works
1. `syncDbWithDataFeed()` retrieves all historical data from Chainlink's ETH/USD data feed by calling `getRoundData()` in our PriceConsumerV3.sol contract. The data is saved to a MongoDB database.
2. `generateMetadata()` queries the database to obtain batches of monthly price data, then passes the data to `createChartImage()`.
3. `createChartImage()` generates a chart image for each batch of price data and saves it to the `output` folder.
4. TODO: Some function uploads all images to IPFS and gets the corresponding URLs.
5. TODO: Another function creates the JSON objects and saves it to the `Chart[]` state variable in our NFT contract.

# Technologies Used
- NFT (topic)
- Alchemy
- Chainlink Data Feed
- TODO: IPFS/Filecoin/NFT.Storage

## Known issues
1. The Chainlink data feed for ETH/USD seems to be missing historical price data between May 6, 2020 and June 4, 2020 (round IDs 0x20000000000001D91 and 0x20000000000001D92).

## Ideas for the Next Iteration
1. Create a function that watches the Chainlink data feed for new round data. Save this to the database.
2. Automatically generate the chart image on the first of each month and prepare it so that it can be minted.