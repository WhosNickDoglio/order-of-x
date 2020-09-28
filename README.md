# Order of X

An unofficial helper for managing reading lists in Marvel Unlimited by series. Series can be configured by modifying the array in series.json.

## Requirements

- Node.js and yarn (or npm)
- Marvel API key

## Installation

```sh
# Clone Repository
git clone https://github.com/shahruz/order-of-x.git
cd order-of-x

# Install Node dependencies
yarn install

# Copy the environment file and customize it with your key
cp .env.example .env
nano .env

# Start app in dev mode
yarn dev

# Or build and start in production mode
yarn build && yarn start
```

## License

This project is licensed under the terms of the [MIT license](LICENSE.md).
