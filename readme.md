# Hashe Builder for angularjs

[![N|Solid](https://shahidullahkhan.com/images/powered.png)](https://shahidullahkhan.com)

[![Build Status](https://shahidullahkhan.com/images/passing.svg)](https://travis-ci.org/joemccann/dillinger)

##### npm module to build all your angularjs javascript files and make a dist of your project to prevent cache issues

# installation
run following command:

```>  npm install angularjs-builder --save```

## requirements
please add the **package.json** file available in the repository if you don't have a package.json in your project.
if you do have. add the following scripts to your package.json

```
"scripts": {
    "hashe": "node ./node_modules/angularjs-builder/index.js",
    "test": "node ./node_modules/angularjs-builder/index.js"
 }
 
```

## how to use
in your main directory create a file named **hasheconfig.json** and include all your scripts as shown below.


```
{
    "scripts": [
        "app.js",
        "directives/mydirective.js",
        "services/constants.js",
        "services/abcservice.js",
        "controllers/mycontrollers.js",
    ]
}

```

now you can watch your files with the below command
```
>  npm run hashe serve
```

to create a build of your javascript files run the below command
```
>  npm run hashe build
```

to create a final build of your javascript files ready to go online you can use
```
>  npm run hashe dist
```

you can also provide base url to the dist, and dist will be created with the base url you provided
```
>  npm run hashe dist base=yourbaseurl
```
