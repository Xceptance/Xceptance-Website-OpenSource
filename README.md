# Xceptance-WebSite-OpenSource

The open source version of our website to share how we used Jekyll, Less, and others. It also shows some tricks around localization as well as demonstrates some htaccess magic to route old URL to new landing pages and make the entire website HTTPS only. But let's discuss the most important points in seperate chapters.

##  The Basic Idea

We wanted to have our new website staticically generated to avoid the need for frequent software updates as well as wanted to have everything in GIT for easy versioning. Only Jekyll offered that and of course its cousins as well. There was also HUGO (http://gohugo.io/), but we discovered the project too late to consider it. Maybe the next time.

The lack of internationalization capabilities is very annonying independent of the framework used. We made the mistake to ignore that fact in the design and decision process because we just thought, Jekyll has a large community and it is rather a mature project. Well, this and a couple of tricks we had to do to generate the urls correctly were the largest pain points. This is also the reason for giving this back to the world, because we want to have others benefit from our work as we benefited from the work of others.

### Multiple Domains

Our website runs under a .de and a .com domain, so we needed something that does not hardcode and host names into the urls. Therefore all urls and links are relative or absolut but without a host name. For some of the url problems in terms of being relative, we wrote a small helper to workaround Jekyll urls generation problems, see `_plugins/url-helper.rb`.

## Two Languages

While having two domains, we also needed two languages. Luckily we could agree on running all pages and posts in both languages without the need of additional filtering. This made it a lot easier.

We used the [jekyll-multiple-languages-plugin](https://github.com/screeninteraction/jekyll-multiple-languages-plugin)

## Mapping Languages to Subdirectories

## Running HTTPS only

## Some Performance Tuning via .htaccess

## Deploying

You will find a short example of a build and ftp upload script in the `bin` directory. We run a Jenkins that polls the GIT repos for two branches `master` and `live-branch`. While `master` is deployed to a non-public test installation, the `live-branch` is our later publically a available version.

We develop in `master` and check everything first locally via `jekyll server` and later on directly on our non-public test site. If we are satisfied with the quality and content, we create a pull request for the `live-branch` and merge all changes. The Jenkins job will deploy this change set in about 2 to 5 minutes after the merge to our live site.

## Projects Used

The projects are not always used in its latest version. We are trying to stay latest but due to the release frequencies and the effort to update things, we rather do that less often as long as now security related problems arises. 

* Jekyll
* Bootstrap
* Less - http://lesscss.org/
* jekyll-multiple-languages-plugin - https://github.com/screeninteraction/jekyll-multiple-languages-plugin

## Licenses

### Code

### Textual Content

### Images

