(['<!DOCTYPE html>',
{
    tag: 'html',
    content: [
        {
            tag: 'head',
            content: [
                {
                    tag: 'meta',
                    attrs: { charset: 'utf-8' }
                },
                {
                    tag: 'link',
                    attrs: {
                        href: 'environment-checker.css', rel: 'stylesheet'
                    }
                },
                {
                    tag: 'script',
                    attrs: { src: 'environment-checker.spec.js' }
                }
            ]
        },
        {
            tag: 'body',
            content: {
                block: 'spec'
            }
        },
        {
            block: 'spec-runner'
        }
    ]
}]);
