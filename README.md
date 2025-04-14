# template-bundlib

My awesome library built using [Bundlib](https://github.com/manferlo81/bundlib)

## First steps

* Add `"name"` and `"description"` fields in `package.json`
* Remove `"private"` field in `package.json` to be able to publish the package
* Declare `NPM_TOKEN` in your GitHub Action secrets to be able to publish on new version tag
* Edit `.versionrc.json` `"header"` field to use the name of your library for CHANGELOG generation
* Create or generate a `LICENSE` file
* Declare your license using `"license"` field in `package.json`
* Edit `"homepage"`, `"repository"` and `"bugs"` fields in `package.json` pointing to the correct URLs
* Edit `"author"` field in `package.json`

## LICENSE
