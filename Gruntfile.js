module.exports = function (grunt) {
    grunt.initConfig({
        //grabs package.json file
        pkg: grunt.file.readJSON('package.json'),

        //minifies css
        cssmin: {
            app: {
                files: {
                    'prod/assets/css/reorder.min.css': 'assets/css/*.css'
                }
            },

            vendor: {
                files: {
                    'prod/assets/css/reorder.vendor.min.css': require('wiredep')().css || []
                }
            }
        },

        //minifies and compiles js
        uglify: {
            options: {
                mangle: false,
                beautify: false
            },

            app: {
                src: 'app/**/*.js',
                dest: 'prod/app/reorder.min.js'
            },

            vendor: {
                files: {
                    'prod/app/reorder.vendor.min.js': require('wiredep')().js
                }
            }
        },

        //sets up sprite
        sprite: {
            all: {
                src: 'assets/img/sprites/*.png',
                retinaSrcFilter: 'assets/img/sprites/*-2x.png',
                dest: 'assets/img/spritesheet.png',
                retinaDest: 'assets/img/spritesheet-2x.png',
                destCss: 'assets/css/sprites.css',
                padding: 5
                // algorithm: 'alt-diagonal'
            }
        },

        //include sources in HTML files automatically
        includeSource: {
            options: {
                basePath: 'prod',
                baseUrl: ''
            },

            prod: {
                files: {
                    'prod/index.html': ['index.tpl.html']
                }
            },

            dev: {
                files: {
                    'index.html': ['index.tpl.html']
                }
            }
        },

        //update html when things are changed
        watch: {
            karma: {
                files: ['app/**/*.js', 'test/spec/**/*.js'],
                tasks: ['karma:continuous:start']
            },
            files: ['assets/css/**/*.css', 'app/**/*.html', 'app/**/*.js'],
            tasks: ['build-dev']
        },

        //wire up bower dependencies
        wiredep: {
            prod: {
                src: ['prod/index.html']
            },

            dev: {
                src: ['index.html']
            }
        },

        //compile angular templates for minification
        ngtemplates: {
            task: {
                src: 'app/**/*.html',
                dest: 'app/templates.js',
                options: {
                    module: 'reorder',
                    htmlmin: {
                        collapseBooleanAttributes:     true,
                        // collapseWhitespace:            true,
                        removeAttributeQuotes:         true,
                        removeComments:                true,
                        removeEmptyAttributes:         true,
                        removeRedundantAttributes:     true,
                        removeScriptTypeAttributes:    true,
                        removeStyleLinkTypeAttributes: true
                    }
                }
            }
        },

        //add mp- prefix to icon css
        // 'string-replace': {
        //     sprite: {
        //         files: {
        //             'assets/css/sprites.css': 'assets/css/sprites.css'
        //         },

        //         options: {
        //             replacements: [
        //                 {
        //                     pattern: /([\."])icon-/g,
        //                     replacement: '$1mp-icon-'
        //                 }
        //             ]
        //         }
        //     }
        // },

        //copy sprite sheets, etc. to production directory
        copy: {
            spritesheets: {
                expand: true,
                src: ['assets/img/*.png'],
                dest: 'prod/'
            }
        },

        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            unit: {
                singleRun: true
            },
            continuous: {
                background: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('test', [
        'karma'
    ]);

    grunt.registerTask('build-prod', 'Compiles and minifies all assets for production', [
        'ngtemplates', 'uglify', 'cssmin', 'includeSource:prod', 'wiredep:prod'
    ]);

    grunt.registerTask('build-dev', 'Updates index.html with correct js/css', function () {
        grunt.config.set('includeSource.options.basePath', '');
        grunt.task.run('includeSource:dev');
        grunt.task.run('wiredep:dev');
    });

    grunt.registerTask('build', 'Executes both production and development builds', ['sprite', 'copy', 'string-replace', 'build-prod', 'build-dev']);
};