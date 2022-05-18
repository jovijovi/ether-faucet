# Ether Faucet

A Faucet contract & microservice for the Ethereum ecosystem.

## Features

- Faucet contract with permission control
- Faucet operation pool
- Use keystore
- RESTFul Faucet APIs for the Ethereum Blockchain and its ecosystem
- Microservice
- Run in Docker

## Supported Chains

- [Ethereum](https://ethereum.org/)
- [Polygon](https://polygon.technology/)

## Development Environment

- typescript `4.6.4`
- node `v16.15.0`
- ts-node `v10.7.0`
- yarn `v1.22.18`

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
