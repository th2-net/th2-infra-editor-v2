# Infra-editor
![](https://img.shields.io/github/package-json/v/th2-net/th2-infra-editor-v2)
![](https://img.shields.io/github/workflow/status/th2-net/th2-infra-editor-v2/build%20&%20publish%20release%20image%20to%20ghcr.io)

This is a web app that displays information about services components, dictionaries and relations between them using `infra-manager`.

## Getting Started

For full functionality of the application you need to have `Grafana` with anonymous access and panel embedding enabled

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation and start

1. Clone the repository using https
   ```sh
   git clone https://github.com/th2-net/th2-infra-editor-v2.git
   ```
   or using ssh
	```sh
   git clone git@github.com:th2-net/th2-infra-editor-v2.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Start application
   ```sh
   npm start
   ```

## API

This app needs the `infra-manager: 1.5.0 (or newer)` backend component to function. It should be accessible at `{infra-editor-path}/backend/*`

## URL query params

- `schema` - text, name of viewing schema
- `object` - text, name of viewing object

### Embedded mode

`Infra-editor` has the ability to be embedded in other applications.

To switch to embedded mode, you must provide next query params in addition to the standard:
- `embedded` - boolean, needs to be `true` to use embedded mode **Required**
- `editorMode` - text, one of the available [embedded modes](#list-of-available-embedded-modes) **Required**

```
Example:
    /?embedded=true&editorMode=dictionaryEditor&schema=commonv3&object=fix50-trm2
```

### List of available embedded modes

* `dictionaryEditor` - Takes name of dictionary as `object` parameter. Allows to edit provided dictionary.

# Configuration
To include this component in your schema, a following yml file needs to be created
```
apiVersion: th2.exactpro.com/v1
kind: Th2CoreBox
metadata:
  name: infra-editor-v2
spec:
  image-name: ghcr.io/th2-net/th2-infra-editor-v2
  image-version: 2.0.13 // change this line if you want to use a newer version
  type: th2-rpt-viewer
  extended-settings:
    chart-cfg:
      ref: schema-stable
      path: custom-component
    service:
      enabled: false
      targetPort: 80
      nodePort: '31276'
    resources:
      limits:
        memory: 15Mi
        cpu: 200m
      requests:
        memory: 10Mi
        cpu: 20m

```