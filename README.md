# Ether Faucet

[![GitHub Actions](https://github.com/jovijovi/ether-faucet/workflows/Test/badge.svg)](https://github.com/jovijovi/ether-faucet)

A Faucet contract & microservice for the Ethereum ecosystem.

## Features

- Faucet contract
  - Permission control
  - Operator pool
- Safe keystore
- RESTFul Faucet APIs for the Ethereum ecosystem
- Microservice run in Docker

## Supported Chains

- [Ethereum](https://ethereum.org/)
- [Polygon](https://polygon.technology/)

## Development Environment

- typescript `4.8.2`
- node `v16.17.0`
- ts-node `v10.9.1`
- yarn `v1.22.19`

## Contract Dependencies

- @openzeppelin/contracts: [`4.7.3`](https://www.npmjs.com/package/@openzeppelin/contracts/v/4.7.3)

## Quick Guide

- Install dependency

  ```shell
  yarn
  ```

- Build code

  Install all dependencies and compile code.

  ```shell
  make build
  ```

- Build docker image

  ```shell
  make docker
  ```

- Run

    - Params

        - `--config` Config filepath. Example:

          ```shell
          ts-node ./src/main/index.ts --config ./conf/app.config.yaml
          ```

    - Run code directly by `ts-node`

      ```shell
      yarn dev-run --config ./conf/app.config.yaml
      ```

    - Run compiled code by `node`

      ```shell
      yarn dist-run --config ./conf/app.config.yaml
      ```

- Clean

  ```shell
  make clean
  ```

## Roadmap

- Development documents
- API documents
- Faucet history

## License

[MIT](LICENSE)
