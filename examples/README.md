# Running Examples

The examples can be run by using the `example` npm script:

```
$ sudo npm run example -- examples/<example-filename>.ts
```

e.g. to run the text-layout CLI example:

```
$ sudo npm run example -- examples/text-layout-cli.ts
```

## Using your own config

Inside this directory is a file named `_config.ts`, which exports the two matrix configuration types: `MatrixOptions` and `RuntimeOptions`.

You can customize this script to fit your needs. All of the examples will import the configuration objects exported by the file.
