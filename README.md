# Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) for Instabase apps.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn run build:set:path`

Builds the app in production mode and sets the `PUBLIC_URL` for the apps built assets.

### `yarn run build:ib`

Reads the `.env` file using `dotenv-cli` and passes it the `yarn run build:set:path` command. This is to populate the `PUBLIC_URL` path when built.

### `yarn run build:ib:prod`

Reads the `.env.production` file using `dotenv-cli` and passes it the `yarn run build:set:path` command. This is to populate the `PUBLIC_URL` path when built.

### `yarn run ib:pkg:preview`

Packages the app(`./build` dir) for preview on the Instabase file system.

### `yarn run ib:upload:preview`

Uploads the app(`./build` dir) to the Instabase file system.

### `yarn run ib:pkg:upload:preview`

Combo command to package and upload the app to instabase in preview mode.

### `yarn run ib:build:pkg:upload:preview`

Combo command running the production build, packaging and uploading for preview on the Instabase file system.

### `yarn run ib:pkg:marketplace`

Packages the application for Instabase Marketplace.

### `yarn run ib:upload:marketplace`

Uploads the app to the Instabase Marketplace.

### `yarn run ib:pkg:upload:marketplace`

Packages and uploads the app to the Instabase Marketplace.

### `yarn run ib:build:pkg:upload:marketplace`

Builds, packages, and uploads the app to the Instabase Marketplace.

### `yarn run ib:init:app:config`

Helper command to create a `ib.app.config.json` file. 

## App tools

`@instabase.com/app-tools` is a package created to help build Instabase apps. This packages is responsible for a number of different things regarding building and publishng apps to Instabase.

App tools can be used in two different modes:

- Instabase file system preview mode (development)
- Instabase marketplace mode (production)

**File system preview mode**

This mode allows for you to package and publish a built single page applcation(SPA) to the Instabase file system. This creates a `main.ibapp` file that is added to the built dir of your SPA and uploads the entire directory to the Instabase file system. From there when you click on a `main.ibapp` file it will open your app on Instabase in a "preview" mode at `/apps/preview/<file-system-path>`. From there you can share this link with whoever has access to your file system path for them to preview.

The environment variables that need to be set for this mode are expected to be set as part of `.env`.

**Marketplace mode**

This mode allows you to package and publish a built SPA to the Instabase Marketplace. This process will convert a built directory into the [format required](https://www.instabase.com/docs/reference/marketplace/package_custom/#creating-a-custom-solution) by the Instabase Marketplace. Then it uploads that the Instabase file system and creates a `.ibsolution` of your app. Then the `.ibsolution` is uploaded to the Instabase Marketplace. Once completed, you can navigate to your Marketplace and find your application likely under Business Solutions > Other. Then you can view your app at `apps/<app-name>/<app-version>/`.

The environment variables that need to be set for this mode are expected to be set as part of `.env.production`.

## Env files

When building and deploying to Instabase there are two `.env` files that you will need. These files are used to set specific environment variables that `app-tools` and your app needs in order to package and upload your apps to Instabase in file system preview mode or to marketplace.

### List of variables for `.env`:

**`IB_ROOT=<instabase-url>`**

Replace `<instabase-url>` with the deployment of Instabase you want to publish your app to.

**`IB_ACCESS_TOKEN=<access-token>`**

Replace `<access-token>` with an access token created on Instabase. This is available under Profile > OAuth applications on Instabase.

**`IB_FS_PATH=/<file-system-path>`**

Replace `<file-system-path>` with a file system path you would like to store packaged built files for your app on Instabase.

**`IB_FS_STATIC_PATH=/fs-static/<file-system-path>/<app-name>-<app-version>`**

This is a special static path that is used for your single page application (SPA) to set its resources references so when the app loads it knows where to find files. If this is set incorrectly then your app will not load correctly. 

This path is always prefixed with `/fs-static/`. Replace `<file-system-path>` with the path you used as part of `IB_FS_PATH`. Replace `<app-name>-<app-version>` with the built app name and version. This should be on your local file system for you to reference.

### List of variables for `.env.production`:

This list is the same as the list for `.env` except for `IB_FS_STATIC_PATH`.

**`IB_FS_STATIC_PATH=/fs-static/system/global/fs/Instabase%20Drive/Applications/Marketplace/All/<app-name>/<app-version>/content`**

This path is still always prefixed with `/fs-static/` but now there is also the Marketplace file system path. Then replace the `<app-name>/<app-version>` with your app name and version. Finally, make sure the path ends with `/content` since this is where the built SPA files are unpackaged onto the Instabase file system.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

